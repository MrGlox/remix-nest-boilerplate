import { Injectable } from "@nestjs/common";
import { Notification } from "@prisma/client";

import { PrismaService } from "../core/database/prisma.service";
import { EventService } from "../core/event/event.service";

@Injectable()
export class NotificationService {
  constructor(
    // private readonly config: ConfigService<AllConfigType>,
    private readonly prisma: PrismaService,
    private readonly event: EventService,
  ) {}

  public async createNotification(userId: string): Promise<Notification> { // TODO: Remove public
    // Retrieve session
    const session = await this.prisma.session.findFirst({
      where: {
        userId,
      },
    })

    console.log("session", session);

    // Create notification
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        message: "notification_created",
      },
    });

    // TODO: Send notification ?
    this.sendNotification(notification.id);

    return notification;
  }

  public async sendNotification(notificationId: string): Promise<void> {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
      },
      select: {
        userId: true,
      },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    const { userId, ...rest } = notification;

    // Send notification
    this.event.sendEvent(userId, rest);
  }

  public async getNotifications(userId: string): Promise<Notification[]> {
    // Get notifications
    const notifications = this.prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      // select: {
      //   id: true,
      //   message: true
      // }
    });

    if (!notifications) {
      return [];
    }

    return notifications;
  }

  public async clearNotification(): Promise<void> {
    // Clear notification
    this.prisma.notification.deleteMany();
  }
}
