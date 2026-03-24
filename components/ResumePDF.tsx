import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Define types
type Job = {
  company: string
  location: string
  title: string
  dates: string
  description?: string
  achievements: string[]
}

type ResumeData = {
  name: string
  location: string
  email: string
  phone: string
  current_title: string
  tagline?: string
  summary: string
  expertise: string[]
  skill_categories?: string[]
  current_job: Job
  previous_jobs: Job[]
  early_career: string[]
  education: string[]
}

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  
  // Header
  header: {
    backgroundColor: '#2F5496',
    padding: 20,
    marginBottom: 15,
    marginLeft: -36,
    marginRight: -36,
    marginTop: -36,
  },
  nameBox: {
    backgroundColor: 'white',
    padding: '6 20',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2F5496',
    textTransform: 'uppercase',
  },
  contact: {
    fontSize: 9,
    color: 'white',
  },
  
  // Title
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#B24C00',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 8,
  },
  
  // Two Column Layout
  columns: {
    flexDirection: 'row',
    gap: 15,
  },
  leftColumn: {
    width: '27%',
  },
  rightColumn: {
    width: '73%',
    borderLeft: '1 solid #CCCCCC',
    paddingLeft: 12,
  },
  
  // Section Headers
  sectionHeader: {
    backgroundColor: '#2F5496',
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    padding: '4 8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  
  // Summary
  summary: {
    fontSize: 9,
    textAlign: 'justify',
    lineHeight: 1.4,
    marginBottom: 8,
  },
  
  // Expertise
  skillItem: {
    fontSize: 8,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  
  // Skill Boxes
  skillBoxes: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 8,
  },
  skillBox: {
    flex: 1,
    backgroundColor: '#FFF4E6',
    borderLeft: '3 solid #B24C00',
    padding: '6 4',
    fontSize: 7,
    fontWeight: 'bold',
    color: '#B24C00',
    textAlign: 'center',
  },
  
  // Jobs
  job: {
    marginBottom: 10,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#555555',
    marginBottom: 3,
  },
  jobDesc: {
    fontSize: 8,
    textAlign: 'justify',
    marginBottom: 4,
  },
  achievement: {
    fontSize: 8,
    marginBottom: 3,
    paddingLeft: 12,
    textAlign: 'justify',
    lineHeight: 1.3,
  },
  bullet: {
    position: 'absolute',
    left: 0,
  },
  
  // Simple sections
  simpleItem: {
    fontSize: 8,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  
  // Page 2
  pageHeader: {
    backgroundColor: '#2F5496',
    color: 'white',
    padding: 10,
    marginBottom: 15,
    marginLeft: -36,
    marginRight: -36,
    marginTop: -36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    fontWeight: 'bold',
  },
})

const ResumePDF = ({ data }: { data: ResumeData }) => (
  <Document>
    {/* PAGE 1 */}
    <Page size="LETTER" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.nameBox}>
          <Text style={styles.name}>{data.name}</Text>
        </View>
        <Text style={styles.contact}>
          {data.location} • {data.email} • {data.phone}
        </Text>
      </View>
      
      {/* Two Columns */}
      <View style={styles.columns}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          <Text style={styles.sectionHeader}>AREAS OF EXPERTISE</Text>
          {data.expertise.map((skill, idx) => (
            <Text key={idx} style={styles.skillItem}>{skill}</Text>
          ))}
        </View>
        
        {/* Right Column */}
        <View style={styles.rightColumn}>
          <Text style={styles.title}>{data.current_title}</Text>
          {data.tagline && <Text style={styles.tagline}>{data.tagline}</Text>}
          
          <Text style={styles.summary}>{data.summary}</Text>
          
          {/* Skill Category Boxes */}
          {data.skill_categories && data.skill_categories.length === 4 && (
            <View style={styles.skillBoxes}>
              {data.skill_categories.map((cat, idx) => (
                <Text key={idx} style={styles.skillBox}>{cat}</Text>
              ))}
            </View>
          )}
          
          <Text style={styles.sectionHeader}>PROFESSIONAL EXPERIENCE</Text>
          
          {/* Current Job */}
          <View style={styles.job}>
            <View style={styles.jobHeader}>
              <Text>{data.current_job.company} • {data.current_job.location}</Text>
              <Text>{data.current_job.dates}</Text>
            </View>
            <Text style={styles.jobTitle}>{data.current_job.title}</Text>
            {data.current_job.description && (
              <Text style={styles.jobDesc}>{data.current_job.description}</Text>
            )}
            {data.current_job.achievements.map((achievement, idx) => (
              <View key={idx} style={{ position: 'relative' }}>
                <Text style={styles.achievement}>
                  <Text style={styles.bullet}>• </Text>
                  {achievement}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Page>
    
    {/* PAGE 2 */}
    <Page size="LETTER" style={styles.page}>
      <View style={styles.pageHeader}>
        <Text>{data.name}</Text>
        <Text>PAGE 2</Text>
      </View>
      
      {/* Previous Jobs */}
      {data.previous_jobs.map((job, jobIdx) => (
        <View key={jobIdx} style={styles.job}>
          <View style={styles.jobHeader}>
            <Text>{job.company} • {job.location}</Text>
            <Text>{job.dates}</Text>
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          {job.description && (
            <Text style={styles.jobDesc}>{job.description}</Text>
          )}
          {job.achievements.map((achievement, idx) => (
            <View key={idx} style={{ position: 'relative' }}>
              <Text style={styles.achievement}>
                <Text style={styles.bullet}>• </Text>
                {achievement}
              </Text>
            </View>
          ))}
        </View>
      ))}
      
      {/* Early Career */}
      <Text style={styles.sectionHeader}>EARLY CAREER</Text>
      {data.early_career.map((item, idx) => (
        <Text key={idx} style={styles.simpleItem}>{item}</Text>
      ))}
      
      {/* Education */}
      <Text style={[styles.sectionHeader, { marginTop: 8 }]}>EDUCATION & PROFESSIONAL DEVELOPMENT</Text>
      {data.education.map((item, idx) => (
        <Text key={idx} style={styles.simpleItem}>{item}</Text>
      ))}
    </Page>
  </Document>
)

export default ResumePDF
