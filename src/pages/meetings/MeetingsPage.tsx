import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Clock, CheckCircle, XCircle, Calendar as CalendarIcon, PlusCircle, Video } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { 
  getConfirmedMeetingsForUser, 
  getPendingMeetingsForUser, 
  updateMeetingStatus,
  requestMeeting,
  addAvailabilitySlot,
  getUserAvailability,
  AvailabilitySlot
} from '../../data/meetings';
import { investors, entrepreneurs } from '../../data/users';

// Quick inline override for React Calendar matching Tailwind Theme
const calendarStyles = `
  .react-calendar { border: none !important; width: 100% !important; background: transparent !important; }
  .react-calendar__tile--active, .react-calendar__tile--hasActive { background: #3B82F6 !important; border-radius: 8px; color: white !important; }
  .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background: #DBEAFE !important; border-radius: 8px; color: #1D4ED8 !important; }
  .react-calendar__tile--now { background: #93C5FD !important; border-radius: 8px; }
`;

export const MeetingsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Data lists
  const [pendingRequests, setPendingRequests] = useState(user ? getPendingMeetingsForUser(user.id) : []);
  const [confirmedMeetings, setConfirmedMeetings] = useState(user ? getConfirmedMeetingsForUser(user.id) : []);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(user ? getUserAvailability(user.id) : []);
  
  // New Slot State
  const [newSlotTime, setNewSlotTime] = useState('10:00 AM');
  
  // New Meeting Request State
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingTargetId, setMeetingTargetId] = useState('');

  if (!user) return null;

  const handleStatusUpdate = (id: string, status: 'accepted' | 'declined') => {
    updateMeetingStatus(id, status);
    // Refresh lists
    setPendingRequests(getPendingMeetingsForUser(user.id));
    setConfirmedMeetings(getConfirmedMeetingsForUser(user.id));
  };

  const getUserName = (id: string) => {
    const u = [...investors, ...entrepreneurs].find(x => x.id === id);
    return u ? u.name : 'Unknown User';
  };

  const handleAddSlot = () => {
    if(!newSlotTime) return;
    addAvailabilitySlot({
      userId: user.id,
      date: selectedDate.toISOString().split('T')[0],
      startTime: newSlotTime,
      endTime: 'TBD'
    });
    setAvailability(getUserAvailability(user.id));
  };

  const handleRequestMeeting = () => {
    if(!meetingTopic || !meetingTargetId) return;
    requestMeeting({
      hostId: meetingTargetId, // they are hosting the availability
      guestId: user.id, // we are requesting
      date: selectedDate.toISOString().split('T')[0],
      time: newSlotTime,
      topic: meetingTopic
    });
    setMeetingTopic('');
    setPendingRequests(getPendingMeetingsForUser(user.id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <style>{calendarStyles}</style>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meetings & Calendar</h1>
        <p className="text-gray-600">Manage your scheduling, availability, and upcoming meetings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Calendar & Adding Slots */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
                Calendar
              </h2>
            </CardHeader>
            <CardBody>
              <Calendar
                onChange={(val) => setSelectedDate(val as Date)}
                value={selectedDate}
                className="mx-auto"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">
                Action for {format(selectedDate, 'MMM do, yyyy')}
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-sm font-semibold mb-2">Set Availability</h3>
                <div className="flex gap-2">
                  <Input 
                    value={newSlotTime} 
                    onChange={e => setNewSlotTime(e.target.value)} 
                    placeholder="e.g. 10:00 AM" 
                    fullWidth 
                  />
                  <Button onClick={handleAddSlot} leftIcon={<PlusCircle size={18} />}>
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2">Request Meeting</h3>
                <div className="space-y-2">
                  <Input 
                    placeholder="Topic..." 
                    value={meetingTopic} 
                    onChange={e => setMeetingTopic(e.target.value)} 
                    fullWidth 
                  />
                  <select 
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={meetingTargetId}
                    onChange={e => setMeetingTargetId(e.target.value)}
                  >
                    <option value="">Select User...</option>
                    {(user.role === 'entrepreneur' ? investors : entrepreneurs).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <Button onClick={handleRequestMeeting} fullWidth variant="primary">
                    Send Request
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Col - Meetings Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Pending Requests</h2>
            </CardHeader>
            <CardBody>
              {pendingRequests.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending requests at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(req => {
                    const isReceived = req.hostId === user.id; // User is the host (received request)
                    return (
                      <div key={req.id} className="flex justify-between items-center p-4 border rounded-md">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={isReceived ? 'warning' : 'primary'}>
                              {isReceived ? 'Received' : 'Sent'}
                            </Badge>
                            <span className="font-semibold text-sm">
                              {isReceived ? getUserName(req.guestId) : getUserName(req.hostId)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800">{req.topic}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Clock size={14} className="mr-1" />
                            {req.date} at {req.time}
                          </div>
                        </div>
                        {isReceived && req.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="success" leftIcon={<CheckCircle size={16} />} onClick={() => handleStatusUpdate(req.id, 'accepted')}>
                              Accept
                            </Button>
                            <Button size="sm" variant="danger" leftIcon={<XCircle size={16} />} onClick={() => handleStatusUpdate(req.id, 'declined')}>
                              Decline
                            </Button>
                          </div>
                        )}
                        {!isReceived && (
                          <Badge variant="gray">Waiting response</Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Confirmed Meetings</h2>
            </CardHeader>
            <CardBody>
              {confirmedMeetings.length === 0 ? (
                <p className="text-gray-500 text-sm">No confirmed meetings.</p>
              ) : (
                <div className="space-y-4">
                  {confirmedMeetings.map(meeting => (
                    <div key={meeting.id} className="flex justify-between items-center p-4 border rounded-md bg-success-50/30">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="success">Confirmed</Badge>
                          <span className="font-semibold text-sm">
                            with {getUserName(meeting.hostId === user.id ? meeting.guestId : meeting.hostId)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{meeting.topic}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <Clock size={14} className="mr-1" />
                          {meeting.date} at {meeting.time}
                        </div>
                      </div>
                      <Link to={`/call/${meeting.id}`}>
                        <Button size="sm" variant="primary" leftIcon={<Video size={16} />}>
                          Join Call
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

        </div>
      </div>
    </div>
  );
};
