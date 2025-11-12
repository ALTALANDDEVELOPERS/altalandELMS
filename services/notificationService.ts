import type { LeaveRequest, User } from '../types';

// This is a mock service. In a real application, this would use an email API (e.g., SendGrid, Mailgun).
export const notificationService = {
  sendLeaveStatusUpdateEmail: async (request: LeaveRequest, allUsers: User[]): Promise<void> => {
    try {
      const requester = request.requester;
      const manager = allUsers.find(user => user.id === requester.managerId);

      const toAddresses = [requester.email];
      if (manager) {
        toAddresses.push(manager.email);
      }

      const subject = `Leave Request Status Updated: ${request.status}`;
      const body = `
        Hello ${requester.name},

        Your leave request from ${request.startDate.toLocaleDateString()} to ${request.endDate.toLocaleDateString()} has been updated to: ${request.status}.

        Reason provided: "${request.reason}"

        This is an automated notification.

        Regards,
        Altaland Leave Management System
      `;
      
      console.log("--- Mock Email Notification ---");
      console.log(`To: ${toAddresses.join(', ')}`);
      console.log(`Subject: ${subject}`);
      console.log(body.trim());
      console.log("-----------------------------");

      // In a real app, you would have something like:
      // await emailApi.send({ to: toAddresses, subject, body });
      
      return Promise.resolve();

    } catch (error) {
      console.error("Failed to send notification email:", error);
    }
  },
};