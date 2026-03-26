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
    padding: 36,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  header: {
    backgroundColor: '#2F5496',
    padding: 16,
    marginBottom: 10,
    marginLeft: -36,
    marginRight: -36,
    marginTop: -36,
  },
  nameBox: {
    backgroundColor: 'white',
    padding: '4 16',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2F5496',
  },
  contact: {
    fontSize: 7.5,
    color: 'white',
  },
  columns: {
    flexDirection: 'row',
    gap: 10,
  },
  leftColumn: {
    width: '27%',
  },
  rightColumn: {
    width: '73%',
    borderLeft: '1 solid #CCCCCC',
    paddingLeft: 9,
  },
  sectionHeader: {
    backgroundColor: '#2F5496',
    color: 'white',
    fontSize: 7,
    fontWeight: 'bold',
    padding: '2.5 5',
    marginBottom: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B24C00',
    marginBottom: 2,
  },
  tagline: {
    fontSize: 7.5,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 5,
  },
  summary: {
    fontSize: 8,
    textAlign: 'justify',
    lineHeight: 1.25,
    marginBottom: 5,
  },
  skillItem: {
    fontSize: 7,
    marginBottom: 1.5,
    lineHeight: 1.15,
  },
  skillBoxes: {
    flexDirection: 'row',
    gap: 3,
    marginVertical: 5,
  },
  skillBox: {
    flex: 1,
    backgroundColor: '#FFF4E6',
    borderLeft: '2 solid #B24C00',
    padding: '3 2',
    fontSize: 6,
    fontWeight: 'bold',
    color: '#B24C00',
    textAlign: 'center',
  },
  job: {
    marginBottom: 6,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 1.5,
  },
  jobTitle: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#555555',
    marginBottom: 1.5,
  },
  jobDesc: {
    fontSize: 7.5,
    textAlign: 'justify',
    marginBottom: 2,
    lineHeight: 1.2,
  },
  achievement: {
    fontSize: 7.5,
    marginBottom: 1.5,
    paddingLeft: 9,
    textAlign: 'justify',
    lineHeight: 1.2,
  },
  simpleItem: {
    fontSize: 7.5,
    marginBottom: 1.5,
    lineHeight: 1.25,
  },
  pageHeader: {
    backgroundColor: '#2F5496',
    color: 'white',
    padding: 7,
    marginBottom: 10,
    marginLeft: -36,
    marginRight: -36,
    marginTop: -36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8.5,
    fontWeight: 'bold',
  },
})

const stripHTML = (text: string): string => {
  if (!text) return ''
  return text.replace(/<\/?strong>/g, '')
}

const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => {
  // Put current job + first TWO previous jobs on page 1
  const page1PreviousJobs = data.previous_jobs && data.previous_jobs.length > 0 ? data.previous_jobs.slice(0, 2) : []
  const page2Jobs = data.previous_jobs && data.previous_jobs.length > 2 ? data.previous_jobs.slice(2) : []
  
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
            
            {/* First TWO Previous Jobs on Page 1 */}
            {page1PreviousJobs.map((job, idx) => (
              <View key={idx} style={styles.job}>
                <View style={styles.jobHeader}>
                  <Text>{job.company} • {job.location}</Text>
                  <Text>{job.dates}</Text>
                </View>
                <Text style={styles.jobTitle}>{job.title}</Text>
                {job.achievements.slice(0, 3).map((achievement, achIdx) => (
                  <Text key={achIdx} style={styles.achievement}>• {stripHTML(achievement)}</Text>
                ))}
              </View>
            ))}
          </View>
        </View>
      </Page>
      
      <Page size="LETTER" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text>{data.name}</Text>
          <Text>PAGE 2</Text>
        </View>
        
        {/* Remaining Previous Jobs */}
        {page2Jobs.map((job, jobIdx) => (
          <View key={jobIdx} style={styles.job}>
            <View style={styles.jobHeader}>
              <Text>{job.company} • {job.location}</Text>
              <Text>{job.dates}</Text>
            </View>
            <Text style={styles.jobTitle}>{job.title}</Text>
            {job.achievements.map((achievement, idx) => (
              <Text key={idx} style={styles.achievement}>• {stripHTML(achievement)}</Text>
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
      </Page>
    </Document>
  )
}

export default ResumePDF
