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
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
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
  },
  contact: {
    fontSize: 9,
    color: 'white',
  },
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
  sectionHeader: {
    backgroundColor: '#2F5496',
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    padding: '4 8',
    marginBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#B24C00',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#666666',
    marginBottom: 8,
  },
  summary: {
    fontSize: 9,
    textAlign: 'justify',
    lineHeight: 1.4,
    marginBottom: 8,
  },
  skillItem: {
    fontSize: 8,
    marginBottom: 2,
    lineHeight: 1.3,
  },
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
    lineHeight: 1.3,
  },
  simpleItem: {
    fontSize: 8,
    marginBottom: 2,
    lineHeight: 1.4,
  },
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

const stripHTML = (text: string): string => {
  if (!text) return ''
  return text.replace(/<\/?strong>/g, '')
}

const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => (
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
        </View>
      </View>
    </Page>
    
    <Page size="LETTER" style={styles.page}>
      <View style={styles.pageHeader}>
        <Text>{data.name}</Text>
        <Text>PAGE 2</Text>
      </View>
      
      {data.previous_jobs.map((job, jobIdx) => (
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
      
      <Text style={[styles.sectionHeader, { marginTop: 8 }]}>EDUCATION & PROFESSIONAL DEVELOPMENT</Text>
      {data.education.map((item, idx) => (
        <Text key={idx} style={styles.simpleItem}>{stripHTML(item)}</Text>
      ))}
    </Page>
  </Document>
)

export default ResumePDF
