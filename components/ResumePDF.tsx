import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

interface Job {
  company: string
  location: string
  title: string
  dates: string
  description?: string
  achievements: string[]
}

interface ResumeData {
  name: string
  location: string
  email: string
  phone: string
  current_title: string
  tagline?: string
  summary: string
  expertise: string[]
  career_highlights?: string[]
  skill_categories?: string[]
  current_job: Job
  previous_jobs: Job[]
  early_career: string[]
  education: string[]
}

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  header: {
    backgroundColor: '#2F5496',
    padding: 14,
    marginBottom: 8,
    marginLeft: -28,
    marginRight: -28,
    marginTop: -28,
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  contact: {
    fontSize: 9,
    color: 'white',
  },
  columns: {
    flexDirection: 'row',
    gap: 10,
  },
  leftColumn: {
    width: '32%',  // INCREASED from 30%
  },
  rightColumn: {
    width: '68%',  // DECREASED from 70%
    borderLeft: '1 solid #CCCCCC',
    paddingLeft: 9,
  },
  sectionHeader: {
    backgroundColor: '#2F5496',
    color: 'white',
    fontSize: 8.5,
    fontWeight: 'bold',
    padding: '3 7',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#B24C00',
    marginBottom: 3,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 5,
    textAlign: 'center',
  },
  summary: {
    fontSize: 9,
    textAlign: 'justify',
    lineHeight: 1.3,
    marginBottom: 5,
  },
  skillItem: {
    fontSize: 8,
    marginBottom: 3,  // INCREASED from 2 for more spacing
    lineHeight: 1.3,  // INCREASED from 1.25 for better readability
  },
  skillBoxes: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 5,
  },
  skillBox: {
    flex: 1,
    backgroundColor: '#FFF4E6',
    borderLeft: '3 solid #B24C00',
    padding: '4 3',
    fontSize: 7,
    fontWeight: 'bold',
    color: '#B24C00',
    textAlign: 'center',
  },
  job: {
    marginBottom: 5,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9.5,
    fontWeight: 'bold',
    marginBottom: 1.5,
  },
  jobTitle: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#555555',
    marginBottom: 2,
  },
  jobDesc: {
    fontSize: 8.5,
    textAlign: 'justify',
    marginBottom: 2,
    lineHeight: 1.2,
  },
  achievement: {
    fontSize: 8.5,
    marginBottom: 1.5,
    paddingLeft: 10,
    textAlign: 'justify',
    lineHeight: 1.25,
  },
  simpleItem: {
    fontSize: 8,
    marginBottom: 1.5,
    lineHeight: 1.3,
  },
  pageHeader: {
    backgroundColor: '#2F5496',
    color: 'white',
    padding: 7,
    marginBottom: 8,
    marginLeft: -28,
    marginRight: -28,
    marginTop: -28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    fontWeight: 'bold',
  },
})

const stripHTML = (text: string): string => {
  if (!text) return ''
  return text.replace(/<\/?strong>/g, '')
}

const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => {
  const allPreviousJobs = data.previous_jobs || []
  
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.contact}>
            {data.location} • {data.email} • {data.phone}
          </Text>
        </View>
        
        <View style={styles.columns}>
          <View style={styles.leftColumn}>
            <Text style={styles.sectionHeader}>AREAS OF EXPERTISE</Text>
            {data.expertise.map((skill, idx) => (
              <Text key={idx} style={styles.skillItem}>{skill}</Text>
            ))}
            
            {data.career_highlights && data.career_highlights.length > 0 && (
              <>
                <Text style={[styles.sectionHeader, { marginTop: 8 }]}>CAREER HIGHLIGHTS</Text>
                {data.career_highlights.map((highlight, idx) => (
                  <Text key={idx} style={styles.skillItem}>• {stripHTML(highlight)}</Text>
                ))}
              </>
            )}
          </View>
          
          <View style={styles.rightColumn}>
            <Text style={styles.title}>{data.current_title}</Text>
            {data.tagline && <Text style={styles.tagline}>{data.tagline}</Text>}
            
            <Text style={styles.summary}>{stripHTML(data.summary)}</Text>
            
            {data.skill_categories && data.skill_categories.length === 4 && (
              <View style={styles.skillBoxes}>
                {data.skill_categories.map((cat, idx) => (
                  <Text key={idx} style={styles.skillBox}>{cat}</Text>
                ))}
              </View>
            )}
            
            <Text style={styles.sectionHeader}>PROFESSIONAL EXPERIENCE</Text>
            
            <View style={styles.job}>
              <View style={styles.jobHeader}>
                <Text>{data.current_job.company} • {data.current_job.location}</Text>
                <Text>{data.current_job.dates}</Text>
              </View>
              <Text style={styles.jobTitle}>{data.current_job.title}</Text>
              {data.current_job.description && (
                <Text style={styles.jobDesc}>{stripHTML(data.current_job.description)}</Text>
              )}
              {data.current_job.achievements.map((achievement, idx) => (
                <Text key={idx} style={styles.achievement}>• {stripHTML(achievement)}</Text>
              ))}
            </View>
            
            {allPreviousJobs.map((job, idx) => (
              <View key={idx} style={styles.job} wrap={false}>
                <View style={styles.jobHeader}>
                  <Text>{job.company} • {job.location}</Text>
                  <Text>{job.dates}</Text>
                </View>
                <Text style={styles.jobTitle}>{job.title}</Text>
                {job.description && (
                  <Text style={styles.jobDesc}>{stripHTML(job.description)}</Text>
                )}
                {job.achievements.map((achievement, achIdx) => (
                  <Text key={achIdx} style={styles.achievement}>• {stripHTML(achievement)}</Text>
                ))}
              </View>
            ))}
            
            <Text style={styles.sectionHeader}>EARLY CAREER</Text>
            {data.early_career.map((item, idx) => (
              <Text key={idx} style={styles.simpleItem}>{stripHTML(item)}</Text>
            ))}
            
            <Text style={[styles.sectionHeader, { marginTop: 5 }]}>EDUCATION & PROFESSIONAL DEVELOPMENT</Text>
            {data.education.map((item, idx) => (
              <Text key={idx} style={styles.simpleItem}>{stripHTML(item)}</Text>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default ResumePDF
