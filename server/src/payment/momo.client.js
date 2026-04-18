const https = require('https')
const crypto = require('crypto')

const MOMO_HOST = 'https://test-payment.momo.vn'
const MOMO_CREATE_PATH = '/v2/gateway/api/create'
const MOMO_MIN_AMOUNT = 1000
const MOMO_MAX_AMOUNT = 50000000

function hmacSha256(rawString, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(rawString).digest('hex')
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload)
    const parsed = new URL(url)

    const request = https.request(
      {
        hostname: parsed.hostname,
        path: parsed.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (response) => {
        let chunks = ''
        response.on('data', (chunk) => {
          chunks += chunk
        })
        response.on('end', () => {
          try {
            const data = JSON.parse(chunks || '{}')
            resolve(data)
          } catch {
            reject(new Error('Invalid JSON response from MoMo'))
          }
        })
      }
    )

    request.on('error', (err) => reject(err))
    request.write(body)
    request.end()
  })
}

class MoMoClient {
  _getConfig() {
    return {
      partnerCode: (process.env.MOMO_PARTNER_CODE || '').trim(),
      accessKey: (process.env.MOMO_ACCESS_KEY || '').trim(),
      secretKey: (process.env.MOMO_SECRET_KEY || '').trim(),
      requestType: (process.env.MOMO_REQUEST_TYPE || 'payWithMethod').trim(),
      lang: (process.env.MOMO_LANG || 'vi').trim(),
      redirectUrl: (process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payments/return').trim(),
      ipnUrl: (process.env.MOMO_IPN_URL || 'http://localhost:5000/payments/ipn').trim(),
    }
  }

  isConfigured() {
    const cfg = this._getConfig()
    return Boolean(cfg.partnerCode && cfg.accessKey && cfg.secretKey)
  }

  _buildCreateSignaturePayload({ config, amount, orderId, requestId, orderInfo, extraData }) {
    return [
      `accessKey=${config.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${config.ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${config.partnerCode}`,
      `redirectUrl=${config.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${config.requestType}`,
    ].join('&')
  }

  verifyIpnSignature(payload) {
    const config = this._getConfig()
    const raw = [
      `accessKey=${config.accessKey}`,
      `amount=${payload.amount || ''}`,
      `extraData=${payload.extraData || ''}`,
      `message=${payload.message || ''}`,
      `orderId=${payload.orderId || ''}`,
      `orderInfo=${payload.orderInfo || ''}`,
      `orderType=${payload.orderType || ''}`,
      `partnerCode=${payload.partnerCode || ''}`,
      `payType=${payload.payType || ''}`,
      `requestId=${payload.requestId || ''}`,
      `responseTime=${payload.responseTime || ''}`,
      `resultCode=${payload.resultCode || ''}`,
      `transId=${payload.transId || ''}`,
    ].join('&')

    const expected = hmacSha256(raw, config.secretKey)
    return expected === payload.signature
  }

  async createPayment({ orderId, amount, orderInfo }) {
    const config = this._getConfig()

    if (!config.partnerCode || !config.accessKey || !config.secretKey) {
      const missing = [
        !config.partnerCode ? 'MOMO_PARTNER_CODE' : null,
        !config.accessKey ? 'MOMO_ACCESS_KEY' : null,
        !config.secretKey ? 'MOMO_SECRET_KEY' : null,
      ].filter(Boolean)

      const err = new Error(`MoMo is not configured. Missing: ${missing.join(', ')}`)
      err.statusCode = 500
      throw err
    }

    const requestId = `${orderId}-${Date.now()}`
    const extraData = ''
    const amountNumber = Math.round(Number(amount || 0))
    if (amountNumber < MOMO_MIN_AMOUNT || amountNumber > MOMO_MAX_AMOUNT) {
      const err = new Error(
        `MoMo amount must be between ${MOMO_MIN_AMOUNT} and ${MOMO_MAX_AMOUNT} VND. Current amount: ${amountNumber} VND`
      )
      err.statusCode = 400
      throw err
    }

    const normalizedAmount = amountNumber.toString()
    const normalizedOrderInfo = orderInfo || `Thanh toan don hang ${orderId}`

    const rawSignature = this._buildCreateSignaturePayload({
      config,
      amount: normalizedAmount,
      orderId,
      requestId,
      orderInfo: normalizedOrderInfo,
      extraData,
    })

    const payload = {
      partnerCode: config.partnerCode,
      partnerName: 'Gifts Shop',
      storeId: 'GiftsShop',
      requestId,
      amount: normalizedAmount,
      orderId,
      orderInfo: normalizedOrderInfo,
      redirectUrl: config.redirectUrl,
      ipnUrl: config.ipnUrl,
      lang: config.lang,
      requestType: config.requestType,
      autoCapture: true,
      extraData,
      signature: hmacSha256(rawSignature, config.secretKey),
    }

    return postJson(`${MOMO_HOST}${MOMO_CREATE_PATH}`, payload)
  }
}

module.exports = new MoMoClient()
