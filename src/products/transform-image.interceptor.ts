
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformImageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((item) => this.transformImage(item));
        }

        if (data?.data && Array.isArray(data.data)) {
          data.data = data.data.map((item) => this.transformImage(item));
          return data;
        }

        return this.transformImage(data);
      }),
    );
  }

  private transformImage(item: any) {
    if (item?.image && Buffer.isBuffer(item.image)) {
      item.image = `data:image/jpeg;base64,${item.image.toString('base64')}`;
    }
    return item;
  }
}