import { BackupConfiguration } from './simaxService';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
}

export interface BackupProgressData {
  jobId: number;
  progress: number;
  message: string;
}

class SimaxWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private clientId: string;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor(clientId: string = 'web-client') {
    this.clientId = clientId;
  }

  connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const wsUrl = `ws://192.168.2.20:8080/ws?clientId=${this.clientId}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('🔗 Conectado a SIMAX WebSocket');
          this.reconnectAttempts = 0;
          this.emit('connection', { connected: true });
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('❌ Desconectado de SIMAX WebSocket');
          this.emit('connection', { connected: false });
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', { error: 'Error de conexión WebSocket' });
          resolve(false);
        };

      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        resolve(false);
      }
    });
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('📨 Mensaje WebSocket recibido:', message);

    switch (message.type) {
      case 'CONNECTION_ESTABLISHED':
        this.emit('connectionEstablished', message.data);
        break;
      case 'CONFIGURATION_SAVED':
        this.emit('configurationSaved', message.data);
        break;
      case 'CONFIGURATION_DATA':
        this.emit('configurationData', message.data);
        break;
      case 'BACKUP_STARTED':
        this.emit('backupStarted', message.data);
        break;
      case 'BACKUP_PROGRESS':
        this.emit('backupProgress', message.data as BackupProgressData);
        break;
      case 'JOB_STATUS_DATA':
        this.emit('jobStatusData', message.data);
        break;
      case 'SSH_TEST_RESULT':
        this.emit('sshTestResult', message.data);
        break;
      case 'ERROR':
        this.emit('error', message.data);
        break;
      default:
        console.warn('Tipo de mensaje WebSocket no reconocido:', message.type);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Intentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('❌ Máximo número de intentos de reconexión alcanzado');
      this.emit('maxReconnectAttemptsReached', {});
    }
  }

  // Enviar mensajes al servidor
  sendMessage(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now()
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket no está conectado');
    }
  }

  // Métodos específicos para SIMAX
  saveConfiguration(config: BackupConfiguration) {
    this.sendMessage('SAVE_CONFIGURATION', config);
  }

  getConfiguration() {
    this.sendMessage('GET_CONFIGURATION', {});
  }

  startBackup() {
    this.sendMessage('START_BACKUP', {});
  }

  getJobStatus() {
    this.sendMessage('GET_JOB_STATUS', {});
  }

  testSshConnection() {
    this.sendMessage('TEST_SSH_CONNECTION', {});
  }

  // Sistema de eventos
  on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Estado de conexión
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Desconectar
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

export default SimaxWebSocketService;
