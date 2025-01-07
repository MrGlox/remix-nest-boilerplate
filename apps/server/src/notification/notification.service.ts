import { Injectable } from "@nestjs/common";
import { Notification, Session, User } from "@prisma/client";

import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../core/database/prisma.service";

@Injectable()
export class NotificationService {
  constructor(
    // private readonly config: ConfigService<AllConfigType>,
    private readonly prisma: PrismaService,
    // private readonly event: EventService,
    private eventEmitter: EventEmitter2,
  ) {}

  public async createNotification(
    userId: string,
  ): Promise<Notification & { user: User & { sessions: Session[] } }> {
    // Create notification
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        message: "notification_created",
      },
      select: {
        id: true,
        type: true,
        action: true,
        status: true,
        message: true,
        read: true,
        createdAt: true,
        user: {
          select: {
            sessions: true,
          },
        },
      },
    });

    setTimeout(() => {
      this.eventEmitter.emit("user.notification", notification);
    }, 300);

    // @ts-ignore
    return notification;
  }

  public async getNotifications(userId: string): Promise<Notification[]> {
    // Get notifications
    const notifications = this.prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    if (!notifications) {
      return [];
    }

    return notifications;
  }

  public async markAllNotificationAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      data: {
        read: true,
      },
      where: {
        userId,
        read: false,
      },
    });
  }

  public async clearNotification(): Promise<void> {
    // Clear notification
    this.prisma.notification.deleteMany();
  }
}
