const pool = require('../config/db')

/**
 * OrderRepository - Data Access Layer
 *
 * Uses PostgreSQL (Supabase) via pg Pool.
 * All methods are async and return plain objects.
 * Keeps the same interface contract so service/controller layers need minimal changes.
 *
 * Methods: findAll(), findById(), create(), update(), deleteById()
 */
class OrderRepository {
  /**
   * Find all orders with optional filtering and pagination
   * @param {Object} options - { status, page, limit }
   * @returns {Promise<{ orders: Array, total: number }>}
   */
  async findAll({ status, customerId, page = 1, limit = 10 } = {}) {
    const conditions = []
    const params = []
    let paramIndex = 1

    if (status) {
      conditions.push(`o.status = $${paramIndex++}`)
      params.push(status)
    }

    if (customerId) {
      conditions.push(`o.customer_id = $${paramIndex++}`)
      params.push(customerId)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Count total
    const countQuery = `SELECT COUNT(*) FROM orders o ${whereClause}`
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0].count, 10)

    // Fetch paginated orders
    const offset = (page - 1) * limit
    const orderQuery = `
      SELECT
        o.order_id, o.order_number, o.customer_id, o.staff_id,
        o.status, o.order_date,
        o.customer_name_snapshot, o.customer_email_snapshot,
        o.customer_phone_snapshot, o.shipping_address_snapshot,
        o.note, o.gift_message, o.payment_method_selected,
        o.subtotal, o.discount_amount, o.total_amount,
        o.created_at, o.updated_at
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `
    const orderParams = [...params, limit, offset]
    const orderResult = await pool.query(orderQuery, orderParams)

    // Fetch items for all returned orders
    const orders = await this._attachItemsToOrders(orderResult.rows)

    return { orders, total }
  }


  /**
   * Find a single order by ID (UUID)
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const query = `
      SELECT
        o.order_id, o.order_number, o.customer_id, o.staff_id,
        o.status, o.order_date,
        o.customer_name_snapshot, o.customer_email_snapshot,
        o.customer_phone_snapshot, o.shipping_address_snapshot,
        o.note, o.gift_message, o.payment_method_selected,
        o.subtotal, o.discount_amount, o.total_amount,
        o.created_at, o.updated_at
      FROM orders o
      WHERE o.order_id = $1
    `
    const result = await pool.query(query, [id])
    if (result.rows.length === 0) return null

    const orders = await this._attachItemsToOrders(result.rows)
    return orders[0]
  }

  /**
   * Create a new order with its items (inside a transaction)
   * @param {Object} orderData - Order plain object from Builder
   * @returns {Promise<Object>} created order with items
   */
  async create(orderData) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Insert order
      const insertOrderQuery = `
        INSERT INTO orders (
          order_id, order_number, customer_id, staff_id,
          status, order_date,
          customer_name_snapshot, customer_email_snapshot,
          customer_phone_snapshot, shipping_address_snapshot,
          note, gift_message, payment_method_selected,
          subtotal, discount_amount, total_amount
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
        RETURNING *
      `
      const orderValues = [
        orderData.orderId,
        orderData.orderNumber,
        orderData.customerId,
        orderData.staffId || null,
        orderData.status,
        orderData.orderDate,
        orderData.customerNameSnapshot,
        orderData.customerEmailSnapshot,
        orderData.customerPhoneSnapshot || null,
        orderData.shippingAddressSnapshot || null,
        orderData.note || null,
        orderData.giftMessage || null,
        orderData.paymentMethodSelected,
        orderData.subtotal,
        orderData.discountAmount || 0,
        orderData.totalAmount,
      ]
      const orderResult = await client.query(insertOrderQuery, orderValues)
      const createdOrder = orderResult.rows[0]

      // Insert order items
      const items = []
      if (orderData.items && orderData.items.length > 0) {
        const insertItemQuery = `
          INSERT INTO order_items (
            order_id, product_id, product_name_snapshot,
            unit_price, quantity, line_total
          ) VALUES ($1,$2,$3,$4,$5,$6)
          RETURNING *
        `
        for (const item of orderData.items) {
          const lineTotal = item.price * item.quantity
          const itemValues = [
            createdOrder.order_id,
            item.productId,
            item.productName,
            item.price,
            item.quantity,
            lineTotal,
          ]
          const itemResult = await client.query(insertItemQuery, itemValues)
          items.push(itemResult.rows[0])
        }
      }

      // Record initial status in history
      await client.query(
        `INSERT INTO order_status_history (order_id, old_status, new_status, note)
         VALUES ($1, NULL, $2, 'Order created')`,
        [createdOrder.order_id, createdOrder.status]
      )

      await client.query('COMMIT')

      return this._mapOrderRow(createdOrder, items)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  /**
   * Update an existing order by ID
   * @param {string} id
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} updated order or null if not found
   */
  async update(id, updateData) {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Build dynamic SET clause
      const setClauses = []
      const values = []
      let paramIndex = 1

      const fieldMap = {
        status: 'status',
        customerNameSnapshot: 'customer_name_snapshot',
        customerEmailSnapshot: 'customer_email_snapshot',
        customerPhoneSnapshot: 'customer_phone_snapshot',
        shippingAddressSnapshot: 'shipping_address_snapshot',
        note: 'note',
        giftMessage: 'gift_message',
        paymentMethodSelected: 'payment_method_selected',
        subtotal: 'subtotal',
        discountAmount: 'discount_amount',
        totalAmount: 'total_amount',
      }

      for (const [jsKey, dbCol] of Object.entries(fieldMap)) {
        if (updateData[jsKey] !== undefined) {
          setClauses.push(`${dbCol} = $${paramIndex++}`)
          values.push(updateData[jsKey])
        }
      }

      // Always update the timestamp
      setClauses.push(`updated_at = NOW()`)

      if (setClauses.length === 1) {
        // Only updated_at — nothing meaningful to update
        await client.query('COMMIT')
        return this.findById(id)
      }

      values.push(id)
      const updateQuery = `
        UPDATE orders SET ${setClauses.join(', ')}
        WHERE order_id = $${paramIndex}
        RETURNING *
      `
      const result = await client.query(updateQuery, values)

      if (result.rows.length === 0) {
        await client.query('COMMIT')
        return null
      }

      // If status changed, record in history
      if (updateData.status) {
        await client.query(
          `INSERT INTO order_status_history (order_id, old_status, new_status)
           VALUES ($1, $2, $3)`,
          [id, updateData._previousStatus || null, updateData.status]
        )
      }

      // If items updated, replace them
      if (updateData.items) {
        await client.query('DELETE FROM order_items WHERE order_id = $1', [id])

        const insertItemQuery = `
          INSERT INTO order_items (
            order_id, product_id, product_name_snapshot,
            unit_price, quantity, line_total
          ) VALUES ($1,$2,$3,$4,$5,$6)
        `
        for (const item of updateData.items) {
          const lineTotal = item.price * item.quantity
          await client.query(insertItemQuery, [
            id,
            item.productId,
            item.productName,
            item.price,
            item.quantity,
            lineTotal,
          ])
        }
      }

      await client.query('COMMIT')

      return this.findById(id)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  /**
   * Delete an order by ID
   * @param {string} id
   * @returns {Promise<boolean>} true if deleted, false if not found
   */
  async deleteById(id) {
    const result = await pool.query(
      'DELETE FROM orders WHERE order_id = $1 RETURNING order_id',
      [id]
    )
    return result.rows.length > 0
  }

  // ── Private helpers ──────────────────────────────────────────

  /**
   * Fetch order_items and attach them to each order row
   */
  async _attachItemsToOrders(orderRows) {
    if (orderRows.length === 0) return []

    const orderIds = orderRows.map((r) => r.order_id)
    const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(',')

    const itemsResult = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY order_item_id`,
      orderIds
    )

    // Group items by order_id
    const itemsByOrder = {}
    for (const item of itemsResult.rows) {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = []
      }
      itemsByOrder[item.order_id].push(item)
    }

    return orderRows.map((row) =>
      this._mapOrderRow(row, itemsByOrder[row.order_id] || [])
    )
  }

  /**
   * Map a raw DB row + items to a clean JS object
   */
  _mapOrderRow(row, itemRows = []) {
    return {
      orderId: row.order_id,
      orderNumber: row.order_number,
      customerId: row.customer_id,
      staffId: row.staff_id,
      status: row.status,
      orderDate: row.order_date,
      customerNameSnapshot: row.customer_name_snapshot,
      customerEmailSnapshot: row.customer_email_snapshot,
      customerPhoneSnapshot: row.customer_phone_snapshot,
      shippingAddressSnapshot: row.shipping_address_snapshot,
      note: row.note,
      giftMessage: row.gift_message,
      paymentMethodSelected: row.payment_method_selected,
      subtotal: parseFloat(row.subtotal),
      discountAmount: parseFloat(row.discount_amount),
      totalAmount: parseFloat(row.total_amount),
      items: itemRows.map((item) => ({
        orderItemId: item.order_item_id,
        productId: item.product_id,
        productName: item.product_name_snapshot,
        quantity: item.quantity,
        price: parseFloat(item.unit_price),
        lineTotal: parseFloat(item.line_total),
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

module.exports = new OrderRepository()
