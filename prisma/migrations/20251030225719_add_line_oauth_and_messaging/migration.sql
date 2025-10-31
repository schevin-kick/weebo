-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "enableReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lineChannelAccessToken" TEXT,
ADD COLUMN     "lineRefreshToken" TEXT,
ADD COLUMN     "lineTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "messageTemplates" JSONB NOT NULL DEFAULT '{"confirmation":{"header":"Your booking is confirmed!","body":"We look forward to seeing you!"},"cancellation":{"header":"Booking Cancelled","body":"Your booking has been cancelled. We hope to see you again soon!"},"reminder":{"header":"Reminder: Upcoming Appointment","body":"Don''t forget your appointment tomorrow!"}}',
ADD COLUMN     "reminderHoursBefore" INTEGER NOT NULL DEFAULT 24;
