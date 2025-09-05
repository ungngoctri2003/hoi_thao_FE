declare module 'qr-scanner' {
  interface QrScannerOptions {
    onDecodeError?: (error: string | Error) => void;
    highlightScanRegion?: boolean;
    highlightCodeOutline?: boolean;
    preferredCamera?: 'environment' | 'user';
    maxScansPerSecond?: number;
    returnDetailedScanResult?: boolean;
  }

  interface QrScannerResult {
    data: string;
  }

  class QrScanner {
    constructor(
      video: HTMLVideoElement,
      onDecode: (result: QrScannerResult) => void,
      options?: QrScannerOptions
    );

    static hasCamera(): boolean;
    start(): Promise<void>;
    stop(): void;
    destroy(): void;
  }

  export = QrScanner;
}
