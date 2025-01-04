export interface NotificationData<T = never> {
  to: string;
  data: T;
}
