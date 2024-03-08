import { PayloadWrapper } from '@src/common/microservice/redis-stream/interface';
import { tags } from 'typia';

export namespace Log {
  export type Payload<T> = PayloadWrapper<{ data: T }>;
  export interface User {
    user_id: string;
    ip: string;
    user_agent: string;
    uri: string; /// real path /// ex: /api/v1/1234
    path: string; /// route path   /// ex: /api/v1/:id
    method: string;
    success: boolean;
    status_code?: number;
    time: number;
    message: string;
    created_at: (string & tags.Format<'date-time'>) | Date;
  }
  export namespace User {
    export type Paylaod = Payload<User>;
  }

  export interface ApiKey {
    key: string;
    ip: string;

    uri: string;
    path: string;

    method: string;
    year: number;
    month: number;
    date: Date; // 사용시간

    status_code: number;
  }
}
