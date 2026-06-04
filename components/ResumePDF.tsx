import React from 'react'
import { Document, Font, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

Font.registerHyphenationCallback((word) => [word])

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
  key_competencies?: string[]
  expertise: string[]
  career_highlights?: string[]
  skill_categories?: string[]
  current_job: Job
  previous_jobs: Job[]
  early_career: string[]
  education: string[]
}

const NAVY = '#284564'
const STEEL = '#89A3C7'
const LIGHT_BLUE = '#EEF4FB'
const COPPER = '#A64F13'
const INK = '#1F2933'

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 30,
    paddingHorizontal: 36,
    fontSize: 9.4,
    fontFamily: 'Helvetica',
    color: INK,
    lineHeight: 1.28,
  },
  topBanner: {
    backgroundColor: NAVY,
    marginTop: -26,
    marginHorizontal: -36,
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: 'center',
  },
  namePlate: {
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 46,
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: NAVY,
    textTransform: 'uppercase',
  },
  contact: {
    fontSize: 9.5,
    color: 'white',
    fontWeight: 'bold',
  },
  intro: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 13,
  },
  leftColumn: {
    width: 176,
    marginRight: 24,
  },
  expertisePanel: {
    backgroundColor: LIGHT_BLUE,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  sidebarTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  expertiseItem: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 3.5,
    lineHeight: 1.2,
  },
  mainIntro: {
    flex: 1,
  },
  executiveTitle: {
    fontSize: 18,
    color: COPPER,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 1.15,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 9.5,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 1.35,
  },
  summary: {
    fontSize: 9.5,
    textAlign: 'justify',
    lineHeight: 1.45,
    marginBottom: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  highlightRule: {
    width: 18,
    borderTopWidth: 1,
    borderTopColor: COPPER,
    borderTopStyle: 'solid',
    marginTop: 5,
    marginRight: 8,
  },
  highlightText: {
    flex: 1,
    color: COPPER,
    fontSize: 9.2,
    fontStyle: 'italic',
    fontWeight: 'bold',
    lineHeight: 1.3,
  },
  sectionBar: {
    backgroundColor: NAVY,
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 5,
    marginTop: 2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  job: {
    marginBottom: 9,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 3,
  },
  company: {
    fontSize: 9.4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  jobTitle: {
    fontSize: 9.2,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  jobDesc: {
    fontSize: 9.2,
    textAlign: 'justify',
    lineHeight: 1.35,
    marginBottom: 5,
  },
  achievementRow: {
    flexDirection: 'row',
    marginBottom: 3.5,
    paddingLeft: 8,
  },
  bullet: {
    width: 10,
    fontSize: 9,
  },
  achievementText: {
    flex: 1,
    fontSize: 9.1,
    textAlign: 'justify',
    lineHeight: 1.3,
  },
  pageHeader: {
    marginTop: -14,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: INK,
    fontWeight: 'bold',
  },
  sideTags: {
    position: 'absolute',
    right: 14,
    top: 330,
    width: 86,
  },
  sideTag: {
    backgroundColor: STEEL,
    color: 'white',
    fontSize: 8.6,
    textAlign: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    marginBottom: 10,
    lineHeight: 1.15,
  },
  sideTagDark: {
    backgroundColor: '#5F83B5',
  },
  simpleItem: {
    fontSize: 9,
    marginBottom: 4,
    lineHeight: 1.28,
  },
  footerSpace: {
    height: 6,
  },
})

const stripHTML = (text: string): string => {
  if (!text) return ''
  return text
    .replace(/<\/?strong>/g, '')
    .replace(/^•\s*/, '')
    .trim()
}

const compact = (items?: string[], limit = 0): string[] => {
  const cleaned = (items || []).map(stripHTML).filter(Boolean)
  return limit > 0 ? cleaned.slice(0, limit) : cleaned
}

const normalizeTitle = (title: string): string => {
  if (!title) return 'Business Leader'
  return title.replace(/\s+/g, ' ').trim()
}

const BulletList = ({ items }: { items: string[] }) => (
  <>
    {items.map((item, idx) => (
      <View key={idx} style={styles.achievementRow}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.achievementText}>{stripHTML(item)}</Text>
      </View>
    ))}
  </>
)

const JobBlock = ({ job }: { job: Job }) => (
  <View style={styles.job}>
    <View style={styles.jobHeader}>
      <Text style={styles.company}>
        {job.company} • {job.location} • {job.dates}
      </Text>
    </View>
    <Text style={styles.jobTitle}>{job.title}</Text>
    {job.description && (
      <Text style={styles.jobDesc}>{stripHTML(job.description)}</Text>
    )}
    <BulletList items={job.achievements || []} />
  </View>
)

const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => {
  const previousJobs = data.previous_jobs || []
  const firstPreviousJob = previousJobs[0]
  const remainingPreviousJobs = previousJobs.slice(1)
  const expertise = compact(data.expertise, 18)
  const highlights = compact(data.career_highlights, 5)
  const sideTags = compact(data.key_competencies?.length ? data.key_competencies : data.skill_categories, 4)

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.topBanner}>
          <View style={styles.namePlate}>
            <Text style={styles.name}>{data.name}</Text>
          </View>
          <Text style={styles.contact}>
            {data.location} • {data.email} • {data.phone}
          </Text>
        </View>

        <View style={styles.intro}>
          <View style={styles.leftColumn}>
            <View style={styles.expertisePanel}>
              <Text style={styles.sidebarTitle}>Areas of Expertise</Text>
              {expertise.map((skill, idx) => (
                <Text key={idx} style={styles.expertiseItem}>{skill}</Text>
              ))}
            </View>
          </View>

          <View style={styles.mainIntro}>
            <Text style={styles.executiveTitle}>{normalizeTitle(data.current_title)}</Text>
            {data.tagline && <Text style={styles.tagline}>{stripHTML(data.tagline)}</Text>}
            <Text style={styles.summary}>{stripHTML(data.summary)}</Text>
            {highlights.map((highlight, idx) => (
              <View key={idx} style={styles.highlightRow}>
                <View style={styles.highlightRule} />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionBar}>Professional Experience</Text>
        <JobBlock job={data.current_job} />
        {firstPreviousJob && <JobBlock job={firstPreviousJob} />}

        {sideTags.length > 0 && (
          <View style={styles.sideTags}>
            {sideTags.map((tag, idx) => (
              <Text
                key={idx}
                style={[styles.sideTag, idx < 2 ? styles.sideTagDark : {}]}
              >
                {tag}
              </Text>
            ))}
          </View>
        )}
      </Page>

      {(remainingPreviousJobs.length > 0 || data.early_career?.length > 0 || data.education?.length > 0) && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.pageHeader}>
            <Text>{data.name}</Text>
            <Text>PAGE 2</Text>
          </View>

          <Text style={styles.sectionBar}>Professional Experience</Text>
          {remainingPreviousJobs.map((job, idx) => (
            <JobBlock key={idx} job={job} />
          ))}

          {data.early_career?.length > 0 && (
            <>
              <Text style={styles.sectionBar}>Early Career</Text>
              {compact(data.early_career).map((item, idx) => (
                <Text key={idx} style={styles.simpleItem}>{item}</Text>
              ))}
            </>
          )}

          {data.education?.length > 0 && (
            <>
              <Text style={styles.sectionBar}>Education & Professional Development</Text>
              {compact(data.education).map((item, idx) => (
                <Text key={idx} style={styles.simpleItem}>{item}</Text>
              ))}
            </>
          )}
          <View style={styles.footerSpace} />
        </Page>
      )}
    </Document>
  )
}

export default ResumePDF
