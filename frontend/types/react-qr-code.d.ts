declare module 'react-qr-code' {
  import { ComponentProps } from 'react'

  interface QRCodeProps {
    value: string
    size?: number
    level?: 'L' | 'M' | 'Q' | 'H'
    bgColor?: string
    fgColor?: string
    style?: React.CSSProperties
    viewBox?: string
  }

  const QRCode: React.FC<QRCodeProps>
  export default QRCode
  export { QRCode }
}
