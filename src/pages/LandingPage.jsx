// src/pages/LandingPage.jsx - Complete modern landing page
import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Avatar,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Divider
} from '@mui/material';
import { 
  Mood, 
  EditNote, 
  CameraAlt, 
  Timeline,
  Analytics,
  Email,
  Security,
  Cloud,
  Star,
  ExpandMore,
  CheckCircle,
  TrendingUp,
  PhotoLibrary,
  Assignment,
  CalendarToday,
  Person,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const mainFeatures = [
    {
      icon: <Mood sx={{ fontSize: 48, color: '#8761a7' }} />,
      title: 'Daily Mood Tracking',
      description: 'Track your emotional journey with our intuitive 5-level mood system. Understand patterns, triggers, and celebrate progress.',
      benefits: ['Visual mood charts', 'Pattern recognition', 'Emotional awareness']
    },
    {
      icon: <EditNote sx={{ fontSize: 48, color: '#8761a7' }} />,
      title: 'Personal Journaling',
      description: 'Express yourself freely with private diary entries. Write without limits, process emotions, and document your growth.',
      benefits: ['Word counting', 'Private & secure', 'Time-locked entries']
    },
    {
      icon: <CameraAlt sx={{ fontSize: 48, color: '#8761a7' }} />,
      title: 'Creative Challenges',
      description: 'Complete mood-based photography challenges that spark creativity and encourage mindful observation of your world.',
      benefits: ['Daily challenges', 'Creative inspiration', 'Photo memories']
    },
    {
      icon: <Email sx={{ fontSize: 48, color: '#8761a7' }} />,
      title: 'Memory Capsules',
      description: 'Create time-locked messages to your future self or loved ones. Share wisdom, goals, and memories across time.',
      benefits: ['Future messaging', 'Email notifications', 'Multiple recipients']
    }
  ];

  const steps = [
    {
      label: 'Create Your Account',
      description: 'Sign up in seconds with just your email. Choose a username and upload an optional profile photo.',
      icon: <Person sx={{ color: '#8761a7' }} />
    },
    {
      label: 'Track Your Daily Mood',
      description: 'Start each day by rating how you feel on a scale of 1-5. Add notes about what influences your mood.',
      icon: <Mood sx={{ color: '#8761a7' }} />
    },
    {
      label: 'Write Your Thoughts',
      description: 'Capture your experiences, thoughts, and reflections in daily diary entries. Express yourself freely.',
      icon: <EditNote sx={{ color: '#8761a7' }} />
    },
    {
      label: 'Complete Challenges',
      description: 'Take on photography challenges based on your mood. Build a visual diary of your experiences.',
      icon: <CameraAlt sx={{ color: '#8761a7' }} />
    },
    {
      label: 'Review Your Journey',
      description: 'Use our timeline and analytics to see your emotional patterns, celebrate progress, and gain insights.',
      icon: <TrendingUp sx={{ color: '#8761a7' }} />
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      avatar: 'S',
      rating: 5,
      text: 'Quivio helped me understand my emotional patterns. The photography challenges are surprisingly therapeutic!'
    },
    {
      name: 'Marcus Johnson',
      avatar: 'M',
      rating: 5,
      text: 'I love the memory capsules feature. Writing to my future self has become a powerful reflection practice.'
    },
    {
      name: 'Elena Rodriguez',
      avatar: 'E',
      rating: 5,
      text: 'The analytics dashboard shows me trends I never noticed. It\'s like having a personal wellness coach.'
    }
  ];

  const faqs = [
    {
      question: 'Is my data private and secure?',
      answer: 'Absolutely. Your journal entries, photos, and personal data are encrypted and stored securely. Only you can access your private content.'
    },
    {
      question: 'How do the photography challenges work?',
      answer: 'Based on your daily mood rating, we suggest creative photography prompts. Complete them to build a visual diary and practice mindfulness.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes! You own your data. You can export your entries, photos, and mood history at any time from your profile settings.'
    },
    {
      question: 'What are memory capsules?',
      answer: 'Memory capsules are time-locked messages you can send to yourself or others. Set a future date and your message will be delivered via email.'
    },
    {
      question: 'Is Quivio free to use?',
      answer: 'Yes! Quivio is completely free with no hidden costs. We believe everyone deserves access to mental wellness tools.'
    },
    {
      question: 'How does the analytics dashboard help me?',
      answer: 'Our analytics provide visual insights into your mood patterns, journaling habits, and personal growth over time. See trends, celebrate milestones, and understand what influences your wellbeing.',
      highlight: false
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#fffefb', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <Box sx={{ 
        backgroundColor: '#fffefb',
        borderBottom: '3px solid #8761a7',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(135, 97, 167, 0.1)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 2,
            px: 3
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#cdd475',
                fontWeight: 700,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}
            >
              Quivio
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  color: '#8761a7',
                  borderColor: '#8761a7',
                  fontFamily: '"Kalam", cursive',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#8761a7',
                    backgroundColor: 'rgba(135, 97, 167, 0.1)'
                  }
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#cdd475',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#dce291'
                  }
                }}
              >
                Get Started Free
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontFamily: '"Kalam", cursive',
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '4rem' },
              color: '#8761a7',
              mb: 3
            }}
          >
            Your Journey to 
            <Box component="span" sx={{ color: '#cdd475', display: 'block' }}>
              Mindful Living
            </Box>
          </Typography>
          
          <Typography 
            variant="h5" 
            color="#8761a7" 
            paragraph
            sx={{ 
              maxWidth: 700, 
              mx: 'auto', 
              mb: 4,
              fontFamily: '"Kalam", cursive',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              lineHeight: 1.6
            }}
          >
            Track your moods, capture memories, write freely, and grow through daily reflection. 
            Quivio makes mindful journaling simple, creative, and meaningful.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/register')}
              endIcon={<ArrowForward />}
              sx={{ 
                minWidth: 200,
                py: 2,
                backgroundColor: '#cdd475',
                color: '#8761a7',
                border: '2px solid #8761a7',
                borderRadius: 4,
                fontFamily: '"Kalam", cursive',
                fontSize: '1.2rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(205, 212, 117, 0.3)',
                '&:hover': {
                  backgroundColor: '#dce291',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(205, 212, 117, 0.4)',
                }
              }}
            >
              Start Your Journey
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              sx={{ 
                minWidth: 150,
                py: 2,
                color: '#8761a7',
                borderColor: '#8761a7',
                fontFamily: '"Kalam", cursive',
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#8761a7',
                  backgroundColor: 'rgba(135, 97, 167, 0.1)'
                }
              }}
            >
              Learn More
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chip 
              icon={<CheckCircle sx={{ color: '#8761a7 !important' }} />}
              label="100% Free Forever" 
              sx={{ 
                backgroundColor: '#dce291',
                color: '#8761a7',
                fontFamily: '"Kalam", cursive',
                fontWeight: 600,
                border: '2px solid #8761a7'
              }} 
            />
            <Chip 
              icon={<Security sx={{ color: '#8761a7 !important' }} />}
              label="Privacy First" 
              sx={{ 
                backgroundColor: '#dce291',
                color: '#8761a7',
                fontFamily: '"Kalam", cursive',
                fontWeight: 600,
                border: '2px solid #8761a7'
              }} 
            />
            <Chip 
              icon={<Cloud sx={{ color: '#8761a7 !important' }} />}
              label="Auto-Save Everything" 
              sx={{ 
                backgroundColor: '#dce291',
                color: '#8761a7',
                fontFamily: '"Kalam", cursive',
                fontWeight: 600,
                border: '2px solid #8761a7'
              }} 
            />
          </Box>
        </Box>

        {/* Features Section */}
        <Box id="features" sx={{ py: 8 }}>
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom 
            sx={{ 
              mb: 6,
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontWeight: 600
            }}
          >
            Everything You Need for Mindful Living
          </Typography>
          
          <Grid container spacing={4}>
            {mainFeatures.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fffbef',
                    border: '3px solid #8761a7',
                    borderRadius: 4,
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(135, 97, 167, 0.2)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: 3,
                        backgroundColor: '#dce291',
                        border: '2px solid #8761a7'
                      }}>
                        {feature.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="h5" 
                          gutterBottom
                          sx={{ 
                            fontFamily: '"Kalam", cursive',
                            color: '#8761a7',
                            fontWeight: 600
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          color="#8761a7"
                          paragraph
                          sx={{ 
                            fontFamily: '"Kalam", cursive',
                            fontSize: '1rem',
                            lineHeight: 1.6
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {feature.benefits.map((benefit, idx) => (
                        <Chip 
                          key={idx}
                          label={benefit}
                          size="small"
                          sx={{
                            backgroundColor: '#cdd475',
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            fontWeight: 600,
                            border: '1px solid #8761a7'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How It Works Section */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom 
            sx={{ 
              mb: 6,
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontWeight: 600
            }}
          >
            How Quivio Works
          </Typography>
          
          <Paper sx={{ 
            p: 4,
            backgroundColor: '#fffbef',
            border: '3px solid #8761a7',
            borderRadius: 4
          }}>
            <Stepper 
              activeStep={activeStep} 
              orientation="vertical"
              sx={{
                '& .MuiStepLabel-label': {
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1.1rem',
                  fontWeight: 600
                },
                '& .MuiStepContent-root': {
                  borderLeft: '2px solid #8761a7'
                }
              }}
            >
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    icon={step.icon}
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: '#8761a7'
                      }
                    }}
                  >
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography 
                      sx={{ 
                        fontFamily: '"Kalam", cursive',
                        color: '#8761a7',
                        fontSize: '1rem',
                        mb: 2
                      }}
                    >
                      {step.description}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => setActiveStep(index + 1)}
                        sx={{
                          mr: 1,
                          backgroundColor: '#cdd475',
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#dce291'
                          }
                        }}
                      >
                        {index === steps.length - 1 ? 'Get Started' : 'Next'}
                      </Button>
                      {index > 0 && (
                        <Button
                          onClick={() => setActiveStep(index - 1)}
                          sx={{
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            fontWeight: 600,
                            textTransform: 'none'
                          }}
                        >
                          Back
                        </Button>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            
            {activeStep === steps.length && (
              <Paper sx={{ 
                p: 3, 
                mt: 3,
                backgroundColor: '#dce291',
                border: '2px solid #8761a7',
                borderRadius: 3,
                textAlign: 'center'
              }}>
                <Typography 
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    mb: 2
                  }}
                >
                  Ready to begin your mindful journey?
                </Typography>
                <Button
                  onClick={() => navigate('/register')}
                  variant="contained"
                  sx={{
                    backgroundColor: '#fffbef',
                    color: '#8761a7',
                    border: '2px solid #8761a7',
                    fontFamily: '"Kalam", cursive',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 4,
                    '&:hover': {
                      backgroundColor: '#fafdd8ff'
                    }
                  }}
                >
                  Create Your Account
                </Button>
              </Paper>
            )}
          </Paper>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ py: 8 }}>
          <Typography 
            variant="h3" 
            align="center" 
            gutterBottom 
            sx={{ 
              mb: 6,
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontWeight: 600
            }}
          >
            Frequently Asked Questions
          </Typography>
          
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {faqs.map((faq, index) => (
              <Accordion 
                key={index}
                sx={{
                  backgroundColor: '#fffbef',
                  border: '2px solid #8761a7',
                  borderRadius: '12px !important',
                  mb: 2,
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary 
                  expandIcon={<ExpandMore sx={{ color: '#8761a7' }} />}
                  sx={{
                    '& .MuiAccordionSummary-content': {
                      fontFamily: '"Kalam", cursive',
                      fontWeight: 600,
                      color: '#8761a7',
                      fontSize: '1.1rem'
                    }
                  }}
                >
                  {faq.question}
                </AccordionSummary>
                <AccordionDetails>
                  <Typography 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#cdd475',
                      fontSize: '1rem',
                      lineHeight: 1.6
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* Final CTA Section */}
        <Paper sx={{ 
          py: 8, 
          px: 4,
          textAlign: 'center',
          backgroundColor: '#fffbef',
          border: '3px solid #8761a7',
          borderRadius: 4,
          my: 6,
          background: 'linear-gradient(135deg, #fffbef 0%, #dce291 100%)'
        }}>
          <Typography 
            variant="h3" 
            gutterBottom
            sx={{ 
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontWeight: 600,
              mb: 2
            }}
          >
            Ready to Transform Your Daily Reflection?
          </Typography>
          <Typography 
            variant="h6" 
            color="#8761a7" 
            paragraph
            sx={{ 
              fontFamily: '"Kalam", cursive',
              mb: 4,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Join thousands of users who have made mindful journaling a meaningful part of their daily routine.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/register')}
            endIcon={<ArrowForward />}
            sx={{
              backgroundColor: '#cdd475',
              color: '#8761a7',
              border: '2px solid #8761a7',
              borderRadius: 4,
              fontFamily: '"Kalam", cursive',
              fontSize: '1.3rem',
              fontWeight: 600,
              textTransform: 'none',
              px: 6,
              py: 2,
              boxShadow: '0 4px 15px rgba(205, 212, 117, 0.3)',
              '&:hover': {
                backgroundColor: '#dce291',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(205, 212, 117, 0.4)',
              }
            }}
          >
            Start Your Free Journey Today
          </Button>
          <Typography 
            variant="body2"
            sx={{ 
              mt: 2,
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontSize: '0.9rem'
            }}
          >
            No credit card required • Always free • Privacy guaranteed
          </Typography>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ 
        backgroundColor: '#8761a7',
        color: 'white',
        py: 4,
        mt: 8
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h5"
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  fontWeight: 700,
                  mb: 2
                }}
              >
                Quivio
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1rem'
                }}
              >
                Your personal journey to mindful living starts here.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
              <Button 
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  fontFamily: '"Kalam", cursive',
                  fontWeight: 600,
                  mr: 2,
                  '&:hover': {
                    borderColor: '#cdd475',
                    color: '#cdd475'
                  }
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#cdd475',
                  color: '#8761a7',
                  fontFamily: '"Kalam", cursive',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#dce291'
                  }
                }}
              >
                Get Started
              </Button>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.3)' }} />
          <Typography 
            variant="body2" 
            textAlign="center"
            sx={{ 
              fontFamily: '"Kalam", cursive',
              opacity: 0.8
            }}
          >
            © 2025 Quivio. Created with passion by Ayah Ali Aljabboori
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;