import { User } from '../types';

export type MeetingStatus = 'pending' | 'accepted' | 'declined';

export interface Meeting {
  id: string;
  hostId: string;
  guestId: string;
  date: string; // ISO date string without time
  time: string; // HH:MM AM/PM
  status: MeetingStatus;
  topic?: string;
}

export interface AvailabilitySlot {
  id: string;
  userId: string;
  date: string; // ISO date string
  startTime: string; // HH:MM AM/PM
  endTime: string;
}

// Initial mock data
let meetings: Meeting[] = [
  {
    id: 'm1',
    hostId: 'e1', // Sarah Johnson (Entrepreneur Demo)
    guestId: 'i1', // Michael Rodriguez (Investor Demo)
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
    time: '10:00 AM',
    status: 'accepted',
    topic: 'Seed Round Discussion with TechWave AI',
  },
  {
    id: 'm2',
    hostId: 'e2', // David Chen
    guestId: 'i1', // Michael Rodriguez
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    time: '02:00 PM',
    status: 'pending',
    topic: 'Follow-up on GreenLife Pitch',
  }
];

let availability: AvailabilitySlot[] = [];

export const getMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(
    (meeting) => meeting.hostId === userId || meeting.guestId === userId
  );
};

export const getConfirmedMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(
    (meeting) => (meeting.hostId === userId || meeting.guestId === userId) && meeting.status === 'accepted'
  );
};

export const getPendingMeetingsForUser = (userId: string): Meeting[] => {
  return meetings.filter(
    (meeting) => (meeting.guestId === userId || meeting.hostId === userId) && meeting.status === 'pending'
  );
};

export const requestMeeting = (meeting: Omit<Meeting, 'id' | 'status'>): Meeting => {
  const newMeeting: Meeting = {
    ...meeting,
    id: `m${Date.now()}`,
    status: 'pending',
  };
  meetings = [...meetings, newMeeting];
  return newMeeting;
};

export const updateMeetingStatus = (id: string, status: MeetingStatus): Meeting | undefined => {
  const meetingIndex = meetings.findIndex((m) => m.id === id);
  if (meetingIndex >= 0) {
    meetings[meetingIndex].status = status;
    return meetings[meetingIndex];
  }
  return undefined;
};

export const getUserAvailability = (userId: string): AvailabilitySlot[] => {
  return availability.filter((slot) => slot.userId === userId);
};

export const addAvailabilitySlot = (slot: Omit<AvailabilitySlot, 'id'>): AvailabilitySlot => {
  const newSlot: AvailabilitySlot = {
    ...slot,
    id: `avail${Date.now()}`,
  };
  availability = [...availability, newSlot];
  return newSlot;
};

export const removeAvailabilitySlot = (id: string) => {
  availability = availability.filter((slot) => slot.id !== id);
};
