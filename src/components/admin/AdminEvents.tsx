import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Clock, MapPin, Video, Users, Tag } from 'lucide-react';
import AdminModal, { FormSection, FormField } from './AdminModal';
import { collection, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  date: any;
  time: string;
  location: string;
  type: 'Q&A' | 'Release' | 'Workshop' | 'Community';
  status: 'Upcoming' | 'Live' | 'Past';
  attendees?: number;
  link?: string;
  createdAt?: any;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    link: '',
    type: 'Q&A',
    status: 'Upcoming'
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      // Sort by date descending
      eventsData.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toMillis() : new Date(a.date).getTime();
        const dateB = b.date instanceof Timestamp ? b.date.toMillis() : new Date(b.date).getTime();
        return dateB - dateA;
      });
      setEvents(eventsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'events');
    });
    return () => unsubscribe();
  }, [user]);

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      // Format date for input field (YYYY-MM-DD)
      let formattedDate = '';
      if (event.date) {
        if (event.date instanceof Timestamp) {
          formattedDate = event.date.toDate().toISOString().split('T')[0];
        } else {
          formattedDate = new Date(event.date).toISOString().split('T')[0];
        }
      }
      
      setFormData({
        ...event,
        date: formattedDate
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        link: '',
        type: 'Q&A',
        status: 'Upcoming'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Convert date string to Timestamp
      const eventDate = new Date(formData.date + 'T' + (formData.time ? formData.time.split(' ')[0] : '00:00') + ':00Z');
      
      const eventDataToSave = {
        title: formData.title,
        description: formData.description,
        date: Timestamp.fromDate(eventDate),
        type: formData.type,
        link: formData.link || formData.location, // Map location to link for schema compatibility if needed
      };

      if (editingEvent) {
        const eventRef = doc(db, 'events', editingEvent.id);
        await setDoc(eventRef, {
          ...eventDataToSave,
          createdAt: editingEvent.createdAt || serverTimestamp()
        }, { merge: true });
      } else {
        const newEventRef = doc(collection(db, 'events'));
        await setDoc(newEventRef, {
          ...eventDataToSave,
          createdAt: serverTimestamp()
        });
      }
      handleCloseModal();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'events');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
      }
    }
  };

  const getDisplayDate = (dateObj: any) => {
    if (!dateObj) return new Date();
    if (dateObj instanceof Timestamp) return dateObj.toDate();
    return new Date(dateObj);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border/50 rounded-3xl p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-starforge-gold/10 flex items-center justify-center border border-starforge-gold/20">
            <Calendar className="w-6 h-6 text-starforge-gold" />
          </div>
          <div>
            <h2 className="font-heading text-2xl text-text-primary">Events CMS</h2>
            <p className="font-ui text-text-secondary text-sm">Manage platform events, Q&As, and workshops.</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-starforge-gold text-void-black rounded-full font-ui font-medium hover:bg-starforge-gold/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Schedule Event
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 gap-4">
        {events.map((event) => {
          const displayDate = getDisplayDate(event.date);
          // Determine status based on date if not explicitly set
          const now = new Date();
          let status = event.status || 'Upcoming';
          if (!event.status) {
            if (displayDate < now) status = 'Past';
            // Simple logic for 'Live' could be added here
          }

          return (
            <div
              key={event.id}
              className="group bg-surface border border-border/50 rounded-2xl p-6 hover:border-starforge-gold/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Date Badge */}
                <div className="w-full lg:w-32 h-32 rounded-xl bg-surface-elevated flex flex-col items-center justify-center border border-border/50 flex-shrink-0">
                  <span className="font-heading text-3xl text-starforge-gold">
                    {displayDate.getDate()}
                  </span>
                  <span className="font-ui text-xs text-text-muted uppercase tracking-widest">
                    {displayDate.toLocaleString('default', { month: 'short' })}
                  </span>
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-ui uppercase tracking-wider ${
                      status === 'Upcoming' ? 'bg-aurora-teal/20 text-aurora-teal' : 
                      status === 'Live' ? 'bg-forge-red/20 text-forge-red animate-pulse' : 
                      'bg-text-muted/20 text-text-muted'
                    }`}>
                      {status}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-ui text-text-muted uppercase tracking-wider">
                      <Tag className="w-3 h-3" /> {event.type}
                    </span>
                  </div>
                  <h3 className="font-heading text-xl text-text-primary mb-2 truncate">{event.title}</h3>
                  <p className="text-text-secondary text-sm line-clamp-2 mb-4">{event.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-ui text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {displayDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {event.link || event.location || 'Online'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {event.attendees || 0} Registered
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-border/50 pt-4 lg:pt-0 lg:pl-6">
                  <button
                    onClick={() => handleOpenModal(event)}
                    className="p-2 text-text-muted hover:text-starforge-gold hover:bg-starforge-gold/10 rounded-lg transition-all"
                    title="Edit Event"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 text-text-muted hover:text-aurora-teal hover:bg-aurora-teal/10 rounded-lg transition-all"
                    title="View Registrations"
                  >
                    <Users className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 text-text-muted hover:text-forge-red hover:bg-forge-red/10 rounded-lg transition-all"
                    title="Delete Event"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {events.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            No events found. Schedule one to get started.
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEvent ? 'Edit Event' : 'Schedule New Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormSection title="Event Details">
            <FormField label="Event Title">
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                placeholder="Enter event name..."
              />
            </FormField>
            <FormField label="Description">
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all h-24 resize-none"
                placeholder="What is this event about?"
              />
            </FormField>
          </FormSection>

          <FormSection title="Schedule & Location">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Date">
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                />
              </FormField>
              <FormField label="Time">
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                />
              </FormField>
            </div>
            <FormField label="Location / Link">
              <input
                type="text"
                required
                value={formData.link || formData.location}
                onChange={(e) => setFormData({ ...formData, link: e.target.value, location: e.target.value })}
                className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                placeholder="e.g. https://zoom.us/..."
              />
            </FormField>
          </FormSection>

          <FormSection title="Classification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Event Type">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                >
                  <option value="Q&A">Q&A Session</option>
                  <option value="Release">Launch Event</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Community">Community Hangout</option>
                </select>
              </FormField>
              <FormField label="Status">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-void-black border border-border/50 rounded-xl px-4 py-3 text-text-primary focus:border-starforge-gold/50 outline-none transition-all"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Live">Live Now</option>
                  <option value="Past">Past Event</option>
                </select>
              </FormField>
            </div>
          </FormSection>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 py-4 bg-starforge-gold text-void-black rounded-xl font-ui font-bold uppercase tracking-widest hover:bg-starforge-gold/90 transition-all"
            >
              {editingEvent ? 'Update Event' : 'Schedule Event'}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-8 py-4 bg-surface-elevated text-text-primary rounded-xl font-ui font-bold uppercase tracking-widest border border-border/50 hover:bg-surface transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

