export interface HealthStatusPayload {
  status: 'OK';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  application: {
    name: string;
    status: 'running';
  };
  database: {
    status: 'connected' | 'connecting' | 'disconnected';
  };
  memory: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}
