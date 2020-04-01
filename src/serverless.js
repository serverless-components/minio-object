const fs = require('fs')
const path = require('path')
const Minio = require('minio')
const { Component } = require('@serverless/core')

const defaults = {}

class MinioObject extends Component {
  async deploy(inputs = {}) {
    const config = {
      ...defaults,
      ...inputs
    }

    const { bucket, src, name } = config

    const filesPath = await this.unzip(src)
    const filePath = path.join(filesPath, name)

    const minio = this.getMinioClient()

    const fileStream = fs.createReadStream(filePath)
    await minio.putObject(bucket, name, fileStream)

    this.state = config
    return this.state
  }

  async remove(inputs = {}) {
    const config = {
      ...defaults,
      ...inputs,
      ...this.state
    }

    const minio = this.getMinioClient()

    const { bucket, name } = config
    await minio.removeObject(bucket, name)

    this.state = {}
    return {}
  }

  // "private" methods
  getMinioClient() {
    const { endpoint, accessKey, secretKey } = this.credentials.minio
    const port = Number(this.credentials.minio.port)
    const useSSL = this.credentials.minio.ssl == 'true'
    return new Minio.Client({
      endPoint: endpoint,
      useSSL,
      port,
      accessKey,
      secretKey
    })
  }
}

module.exports = MinioObject
