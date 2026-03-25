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
  skill_categories?: string[]
  current_job: Job
  previous_jobs: Job[]
  early_career: string[]
  education: string[]
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  header: {
    backgroundColor: '#2F5496',
    padding: 18,
    marginBottom: 12,
    marginLeft: -40,
    marginRight: -40,
    marginTop: -40,
  },
  nameBox: {
    backgroundColor: 'white',
    padding: '5 18',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F5496',
  },
  contact: {
    fontSize: 8,
    color: 'white',
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
  },
  leftColumn: {
    width: '27%',
  },
  rightColumn: {
    width: '73%',
    borderLeft: '1 solid #CCCCCC',
    paddingLeft: 10,
  },
  sectionHeader: {
    backgroundColor: '#2F5496',
    color: 'white',
    fontSize: 7.5,
    fontWeight: 'bold',
    padding: '3 6',
    marginBottom: 5,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B24C00',
    marginBottom: 3,
  },
  tagline: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 6,
  },
  summary: {
    fontSize: 8.5,
    textAlign: 'justify',
    lineHeight: 1.3,
    marginBottom: 6,
  },
  skillItem: {
    fontSize: 7.5,
    marginBottom: 2,
    lineHeight: 1.2,
  },
  skillBoxes: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 6,
  },
  skillBox: {
    flex: 1,
    backgroundColor: '#FFF4E6',
    borderLeft: '2 solid #B24C00',
    padding: '4 3',
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#B24C00',
    textAlign: 'center',
  },
  job: {
    marginBottom: 8,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8.5,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 8.5,
    fontStyle: 'italic',
    color: '#555555',
    marginBottom: 2,
  },
  jobDesc: {
    fontSize: 8,
    textAlign: 'justify',
    marginBottom: 3,
    lineHeight: 1.2,
  },
  achievement: {
    fontSize: 8,
    marginBottom: 2,
    paddingLeft: 10,
    textAlign: 'justify',
    lineHeight: 1.25,
  },
  simpleItem: {
    fontSize: 8,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  pageHeader: {
    backgroundColor: '#2F5496',
    color: 'white',
    padding: 8,
    marginBottom: 12,
    marginLeft: -40,
    marginRight: -40,
    marginTop: -40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    fontWeight: 'bold',
  },
})

const stripHTML = (text: string): string => {
  if (!text) return ''
  return text.replace(/<\/?strong>/g, '')
}

const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => {
  // Put current job + first previous job on page 1, rest on page 2
  const firstPreviousJob = data.previous_jobs && data.previous_jobs.length > 0 ? data.previous_jobs[0] : null
  const remainingJobs = data.previous_jobs && data.previous_jobs.length > 1 ? data.previous_jobs.slice(1) : []
  
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.nameBox}>
            <Text style={styles.name}>{data.name}</Text>
          </View>
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
            
            {/* Current Job */}
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
            
            {/* First Previous Job (if exists) to fill page 1 */}
            {firstPreviousJob && (
              <View style={styles.job}>
                <View style={styles.jobHeader}>
                  <Text>{firstPreviousJob.company} • {firstPreviousJob.location}</Text>
                  <Text>{firstPreviousJob.dates}</Text>
                </View>
                <Text style={styles.jobTitle}>{firstPreviousJob.title}</Text>
                {firstPreviousJob.description && (
                  <Text style={styles.jobDesc}>{stripHTML(firstPreviousJob.description)}</Text>
                )}
                {firstPreviousJob.achievements.slice(0, 3).map((achievement, idx) => (
                  <Text key={idx} style={styles.achievement}>• {stripHTML(achievement)}</Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
      
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text>{data.name}</Text>
          <Text>PAGE 2</Text>
        </View>
        
        {/* Continue first previous job if it has more than 3 bullets */}
        {firstPreviousJob && firstPreviousJob.achievements.length > 3 && (
          <View style={styles.job}>
            <View style={styles.jobHeader}>
              <Text>{firstPreviousJob.company} • {firstPreviousJob.location} (continued)</Text>
              <Text>{firstPreviousJob.dates}</Text>
            </View>
            {firstPreviousJob.achievements.slice(3).map((achievement, idx) => (
              <Text key={idx} style={styles.achievement}>• {stripHTML(achievement)}</Text>
            ))}
          </View>
        )}
        
        {/* Remaining Previous Jobs */}
        {remainingJobs.map((job, jobIdx) => (
          <View key={jobIdx} style={styles.job}>
            <View style={styles.jobHeader}>
              <Text>{job.company} • {job.location}</Text>
              <Text>{job.dates}</Text>
            </View>
            <Text style={styles.jobTitle}>{job.title}</Text>
            {job.description && (
              <Text style={styles.jobDesc}>{stripHTML(job.description)}</Text>
            )}
            {job.achievements.map((achievement, idx) => (
              <Text key={idx} style={styles.achievement}>• {stripHTML(achievement)}</Text>
            ))}
          </View>
        ))}
        
        <Text style={styles.sectionHeader}>EARLY CAREER</Text>
        {data.early_career.map((item, idx) => (
          <Text key={idx} style={styles.simpleItem}>{stripHTML(item)}</Text>
        ))}
        
        <Text style={[styles.sectionHeader, { marginTop: 6 }]}>EDUCATION & PROFESSIONAL DEVELOPMENT</Text>
        {data.education.map((item, idx) => (
          <Text key={idx} style={styles.simpleItem}>{stripHTML(item)}</Text>
        ))}
      </Page>
    </Document>
  )
}

export default ResumePDF
