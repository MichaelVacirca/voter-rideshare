// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /lib/services/notification-service.ts
// Notification service - keeping everyone in the loop!

import { Collection, ObjectId } from 'mongodb';
import { getCollection } from '@/lib/mongodb';
import { MONGODB_CONFIG } from '@/config';
import { sendSMS } from '@/lib/sms';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { RideRequestModel } from '@/types/ride';
import { UserProfileModel } from '@/types/user';
import { COMMUNICATION_PREFS } from '@/types/user';

interface NotificationTemplate {
  sms: string;
  email: {
    subject: string;
    body: string;
  };
  push: {
    title: string;
    body: string;
    data?: Record<string, string>;
  };
}

export class NotificationService {
  private rideCollection: Collection<RideRequestModel>;
  private userCollection: Collection<UserProfileModel>;

  constructor() {
    this.rideCollection = getCollection<RideRequestModel>(
      MONGODB_CONFIG.collections.rides
    );
    this.userCollection = getCollection<UserProfileModel>(
      MONGODB_CONFIG.collections.users
    );
  }

  /**
   * Send notifications to both rider and driver about a match
   */
  async notifyMatch(rideId: string): Promise<void> {
    const ride = await this.rideCollection.findOne({
      _id: new ObjectId(rideId),
    });

    if (!ride) return;

    const [rider, driver] = await Promise.all([
      this.userCollection.findOne({ _id: new ObjectId(ride.userId) }),
      this.userCollection.findOne({ _id: new ObjectId(ride.driverId) }),
    ]);

    if (!rider || !driver) return;

    // Notify rider
    const riderTemplate = this.getMatchTemplate('rider', {
      driverName: driver.fullName,
      pickupTime: ride.pickupTime.toLocaleTimeString(),
    });
    await this.sendUserNotifications(rider, riderTemplate);

    // Notify driver
    const driverTemplate = this.getMatchTemplate('driver', {
      riderName: rider.fullName,
      pickupTime: ride.pickupTime.toLocaleTimeString(),
      pickupLocation: ride.pickupLocation,
    });
    await this.sendUserNotifications(driver, driverTemplate);
  }

  /**
   * Send notifications about ride confirmation
   */
  async notifyRideConfirmed(rideId: string): Promise<void> {
    const ride = await this.rideCollection.findOne({
      _id: new ObjectId(rideId),
    });

    if (!ride) return;

    const [rider, driver] = await Promise.all([
      this.userCollection.findOne({ _id: new ObjectId(ride.userId) }),
      this.userCollection.findOne({ _id: new ObjectId(ride.driverId) }),
    ]);

    if (!rider || !driver) return;

    // Notify both parties
    const riderTemplate = this.getConfirmationTemplate('rider', {
      driverName: driver.fullName,
      pickupTime: ride.pickupTime.toLocaleTimeString(),
      vehicleInfo: driver.vehicle,
    });
    await this.sendUserNotifications(rider, riderTemplate);

    const driverTemplate = this.getConfirmationTemplate('driver', {
      riderName: rider.fullName,
      pickupTime: ride.pickupTime.toLocaleTimeString(),
      pickupLocation: ride.pickupLocation,
    });
    await this.sendUserNotifications(driver, driverTemplate);
  }

  /**
   * Send notifications to a user based on their preferences
   */
  private async sendUserNotifications(
    user: UserProfileModel,
    template: NotificationTemplate
  ): Promise<void> {
    const prefs = user.communicationPrefs;

    await Promise.all([
      // SMS Notification
      prefs.includes(COMMUNICATION_PREFS.SMS) && user.phoneVerified &&
        sendSMS(user.phone, template.sms),

      // Email Notification
      prefs.includes(COMMUNICATION_PREFS.EMAIL) && user.emailVerified &&
        sendEmail(user.email, template.email.subject, template.email.body),

      // Push Notification
      prefs.includes(COMMUNICATION_PREFS.PUSH) && user.pushToken &&
        sendPushNotification(user.pushToken, template.push),
    ]);
  }

  private getMatchTemplate(
    type: 'rider' | 'driver',
    data: Record<string, any>
  ): NotificationTemplate {
    if (type === 'rider') {
      return {
        sms: `Your ride has been matched! ${data.driverName} will pick you up at ${data.pickupTime}.`,
        email: {
          subject: 'Ride Matched - Voter Rideshare',
          body: `Your ride request has been matched with ${data.driverName}...`,
        },
        push: {
          title: 'Ride Matched!',
          body: `${data.driverName} will pick you up at ${data.pickupTime}`,
          data: { type: 'match', rideId: data.rideId },
        },
      };
    } else {
      return {
        sms: `New ride request! ${data.riderName} needs a ride at ${data.pickupTime}.`,
        email: {
          subject: 'New Ride Request - Voter Rideshare',
          body: `You have a new ride request from ${data.riderName}...`,
        },
        push: {
          title: 'New Ride Request',
          body: `${data.riderName} needs a ride at ${data.pickupTime}`,
          data: { type: 'match', rideId: data.rideId },
        },
      };
    }
  }

  private getConfirmationTemplate(
    type: 'rider' | 'driver',
    data: Record<string, any>
  ): NotificationTemplate {
    // Similar to getMatchTemplate but with confirmation-specific messaging
    // Implementation omitted for brevity
    return {} as NotificationTemplate;
  }
}

export const notificationService = new NotificationService();