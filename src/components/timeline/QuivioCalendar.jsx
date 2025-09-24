// src/components/timeline/QuivioCalendar.jsx
import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import {
  Box,
  Typography,
  Card,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
  CameraAlt,
  Edit,
  Assignment,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

// Mood configuration - consistent with your current setup
const MOOD_COLORS = {
  1: '#ff6b6b',    // Red - Very Sad
  2: '#ffa726',    // Orange - Sad  
  3: '#42a5f5',    // Blue - Neutral
  4: '#8cd38f',    // Light Green - Happy
  5: '#47a14a'     // Dark Green - Very Happy
};

const MOOD_LABELS = {
  1: 'Very Sad',
  2: 'Sad',
  3: 'Neutral',
  4: 'Happy',
  5: 'Very Happy'
};

const MOOD_ICONS = {
  1: SentimentVeryDissatisfied,
  2: SentimentDissatisfied,
  3: SentimentNeutral,
  4: SentimentSatisfied,
  5: SentimentVerySatisfied
};

const QuivioCalendar = ({ 
  calendarData, 
  onDayClick, 
  currentDate, 
  onDateChange,
  loading = false 
}) => {
  // Transform your calendar data to React Big Calendar events
  const events = useMemo(() => {
    if (!calendarData || !calendarData.calendar_data) return [];

    const events = [];
    
    Object.entries(calendarData.calendar_data).forEach(([dateString, dayData]) => {
      const eventDate = new Date(dateString);
      
      // Create events for each type of activity
      if (dayData.mood) {
        events.push({
          id: `mood-${dateString}`,
          title: `${MOOD_LABELS[dayData.mood.level]}`,
          start: eventDate,
          end: eventDate,
          allDay: true,
          resource: {
            type: 'mood',
            data: dayData.mood,
            level: dayData.mood.level,
            dateString: dateString,
            dayData: dayData
          }
        });
      }

      if (dayData.diary) {
        events.push({
          id: `diary-${dateString}`,
          title: `Diary (${dayData.diary.word_count} words)`,
          start: eventDate,
          end: eventDate,
          allDay: true,
          resource: {
            type: 'diary',
            data: dayData.diary,
            dateString: dateString,
            dayData: dayData
          }
        });
      }

      if (dayData.photos && dayData.photos.length > 0) {
        events.push({
          id: `photos-${dateString}`,
          title: `${dayData.photos.length} Photo${dayData.photos.length !== 1 ? 's' : ''}`,
          start: eventDate,
          end: eventDate,
          allDay: true,
          resource: {
            type: 'photos',
            data: dayData.photos,
            dateString: dateString,
            dayData: dayData
          }
        });
      }

      if (dayData.challenge) {
        events.push({
          id: `challenge-${dateString}`,
          title: `Challenge ${dayData.challenge.is_completed ? '✓' : '○'}`,
          start: eventDate,
          end: eventDate,
          allDay: true,
          resource: {
            type: 'challenge',
            data: dayData.challenge,
            dateString: dateString,
            dayData: dayData
          }
        });
      }
    });

    return events;
  }, [calendarData]);

  // Custom event component
  const EventComponent = ({ event }) => {
    const { resource } = event;
    
    const getEventStyle = () => {
      switch (resource.type) {
        case 'mood':
          return {
            backgroundColor: MOOD_COLORS[resource.level] + '20',
            border: `2px solid ${MOOD_COLORS[resource.level]}`,
            borderRadius: '8px',
            color: MOOD_COLORS[resource.level],
            fontSize: '11px',
            fontFamily: '"Kalam", cursive',
            fontWeight: '600',
            padding: '2px 6px',
            margin: '1px 0'
          };
        case 'diary':
          return {
            backgroundColor: '#dce291',
            border: '2px solid #8761a7',
            borderRadius: '8px',
            color: '#8761a7',
            fontSize: '11px',
            fontFamily: '"Kalam", cursive',
            fontWeight: '600',
            padding: '2px 6px',
            margin: '1px 0'
          };
        case 'photos':
          return {
            backgroundColor: '#e3f2fd',
            border: '2px solid #2196f3',
            borderRadius: '8px',
            color: '#2196f3',
            fontSize: '11px',
            fontFamily: '"Kalam", cursive',
            fontWeight: '600',
            padding: '2px 6px',
            margin: '1px 0'
          };
        case 'challenge':
          return {
            backgroundColor: resource.data.is_completed ? '#e8f5e8' : '#fff3e0',
            border: `2px solid ${resource.data.is_completed ? '#4caf50' : '#ff9800'}`,
            borderRadius: '8px',
            color: resource.data.is_completed ? '#4caf50' : '#ff9800',
            fontSize: '11px',
            fontFamily: '"Kalam", cursive',
            fontWeight: '600',
            padding: '2px 6px',
            margin: '1px 0'
          };
        default:
          return {};
      }
    };

    const getIcon = () => {
      switch (resource.type) {
        case 'mood':
          const MoodIcon = MOOD_ICONS[resource.level];
          return <MoodIcon sx={{ fontSize: 14, mr: 0.5 }} />;
        case 'diary':
          return <Edit sx={{ fontSize: 14, mr: 0.5 }} />;
        case 'photos':
          return <CameraAlt sx={{ fontSize: 14, mr: 0.5 }} />;
        case 'challenge':
          return resource.data.is_completed ? 
            <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} /> : 
            <Assignment sx={{ fontSize: 14, mr: 0.5 }} />;
        default:
          return null;
      }
    };

    return (
      <div style={getEventStyle()}>
        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
          {getIcon()}
          <span>{event.title}</span>
        </Box>
      </div>
    );
  };

  // Handle date navigation
  const handleNavigate = (date) => {
    onDateChange(date);
  };

  // Handle day cell click
  const handleSelectSlot = (slotInfo) => {
    const dateString = moment(slotInfo.start).format('YYYY-MM-DD');
    if (calendarData && calendarData.calendar_data[dateString]) {
      onDayClick(slotInfo.start.getDate(), calendarData.calendar_data[dateString]);
    }
  };

  // Handle event click
  const handleSelectEvent = (event) => {
    const day = event.start.getDate();
    onDayClick(day, event.resource.dayData);
  };

  // Custom day cell wrapper to highlight days with data
  const dayPropGetter = (date) => {
    const dateString = moment(date).format('YYYY-MM-DD');
    const hasData = calendarData && calendarData.calendar_data[dateString];
    const isToday = moment(date).isSame(moment(), 'day');
    
    return {
      className: hasData ? 'has-data' : '',
      style: {
        backgroundColor: hasData ? '#fffbef' : '#f8f9fa',
        border: isToday ? '3px solid #cdd475' : hasData ? '2px solid #8761a7' : '1px solid #e0e0e0',
        cursor: hasData ? 'pointer' : 'default'
      }
    };
  };

  const calendarStyle = {
    height: '600px',
    fontFamily: '"Kalam", cursive',
    
    // Custom CSS for the calendar
    '& .rbc-calendar': {
      backgroundColor: '#fffbef',
      borderRadius: '12px',
      border: '3px solid #8761a7',
      overflow: 'hidden'
    },
    
    '& .rbc-header': {
      backgroundColor: '#cdd475',
      color: '#8761a7',
      fontFamily: '"Kalam", cursive',
      fontWeight: '600',
      fontSize: '1.1rem',
      padding: '12px 8px',
      border: 'none',
      borderBottom: '2px solid #8761a7'
    },
    
    '& .rbc-month-view': {
      backgroundColor: '#fffbef'
    },
    
    '& .rbc-date-cell': {
      padding: '8px',
      minHeight: '120px'
    },
    
    '& .rbc-date-cell.has-data': {
      backgroundColor: '#fffbef',
      border: '2px solid #8761a7'
    },
    
    '& .rbc-today': {
      backgroundColor: '#fff3cd !important',
      border: '3px solid #cdd475 !important'
    },
    
    '& .rbc-off-range-bg': {
      backgroundColor: '#f5f5f5'
    },
    
    '& .rbc-event': {
      borderRadius: '8px',
      border: 'none',
      margin: '1px 0'
    },
    
    '& .rbc-toolbar': {
      backgroundColor: '#cdd475',
      padding: '12px 16px',
      borderBottom: '3px solid #8761a7',
      marginBottom: '0'
    },
    
    '& .rbc-toolbar button': {
      backgroundColor: '#8761a7',
      color: 'white',
      border: '2px solid #8761a7',
      borderRadius: '8px',
      fontFamily: '"Kalam", cursive',
      fontWeight: '600',
      padding: '8px 16px',
      margin: '0 4px',
      cursor: 'pointer'
    },
    
    '& .rbc-toolbar button:hover': {
      backgroundColor: '#9e7ebf',
      transform: 'scale(1.05)'
    },
    
    '& .rbc-toolbar button.rbc-active': {
      backgroundColor: '#fffbef',
      color: '#8761a7'
    },
    
    '& .rbc-toolbar-label': {
      color: '#8761a7',
      fontFamily: '"Kalam", cursive',
      fontSize: '1.5rem',
      fontWeight: '700'
    }
  };

  return (
    <Card sx={{ 
      backgroundColor: '#fffbef',
      border: '3px solid #8761a7',
      borderRadius: 4,
      overflow: 'hidden'
    }}>
      <Box sx={calendarStyle}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={['month']}
          defaultView="month"
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          components={{
            event: EventComponent
          }}
          dayPropGetter={dayPropGetter}
          popup={false}
          showMultiDayTimes={false}
        />
      </Box>
    </Card>
  );
};

export default QuivioCalendar;