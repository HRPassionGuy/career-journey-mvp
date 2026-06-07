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

const NAVY = '#294766'
const STEEL = '#86A3CC'
const STEEL_DARK = '#5E84BC'
const LIGHT_BLUE = '#EDF3FA'
const COPPER = '#A54A08'
const INK = '#111111'

const styles = StyleSheet.create({
  pageOne: {
    position: 'relative',
    fontFamily: 'Helvetica',
    color: INK,
    backgroundColor: 'white',
  },
  banner: {
    position: 'absolute',
    top: 26,
    left: 36,
    width: 540,
    height: 60,
    backgroundColor: NAVY,
    borderWidth: 0.7,
    borderColor: '#AAB8C7',
    alignItems: 'center',
  },
  namePlate: {
    position: 'absolute',
    top: 8,
    left: 145,
    width: 250,
    height: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: NAVY,
    fontSize: 16.5,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  contact: {
    position: 'absolute',
    top: 43,
    left: 20,
    width: 500,
    color: 'white',
    fontSize: 10.5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  expertisePanel: {
    position: 'absolute',
    top: 101,
    left: 36,
    width: 162,
    height: 328,
    backgroundColor: LIGHT_BLUE,
    paddingTop: 10,
    paddingHorizontal: 7,
  },
  expertiseTitle: {
    fontSize: 8.8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  expertiseItem: {
    fontSize: 9.35,
    lineHeight: 1.28,
    textAlign: 'center',
    marginBottom: 1.4,
  },
  profileMain: {
    position: 'absolute',
    top: 98,
    left: 204,
    width: 372,
    height: 331,
  },
  executiveTitle: {
    color: COPPER,
    fontWeight: 'bold',
    letterSpacing: 0.7,
    lineHeight: 1.05,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 11,
  },
  tagline: {
    fontSize: 9.7,
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 1.35,
    textAlign: 'center',
    marginHorizontal: 18,
    marginBottom: 11,
  },
  summary: {
    fontSize: 9.45,
    lineHeight: 1.48,
    textAlign: 'justify',
    marginBottom: 13,
  },
  highlightRow: {
    flexDirection: 'row',
    marginBottom: 4.5,
  },
  highlightRule: {
    width: 18,
    borderTopWidth: 0.8,
    borderTopColor: COPPER,
    marginTop: 5,
    marginRight: 8,
  },
  highlightText: {
    flex: 1,
    color: COPPER,
    fontSize: 9.05,
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 1.25,
  },
  sectionBar: {
    position: 'absolute',
    top: 442,
    left: 36,
    width: 540,
    height: 24,
    backgroundColor: NAVY,
    borderWidth: 0.7,
    borderColor: '#AAB8C7',
    color: 'white',
    fontSize: 10.8,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    paddingTop: 5.2,
    textTransform: 'uppercase',
  },
  currentCompany: {
    position: 'absolute',
    top: 478,
    left: 39,
    width: 534,
    fontSize: 9.5,
    fontWeight: 'bold',
    letterSpacing: 0.8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  currentTitle: {
    position: 'absolute',
    top: 494,
    left: 39,
    width: 534,
    fontSize: 9.6,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  currentDescription: {
    position: 'absolute',
    top: 514,
    left: 39,
    width: 534,
    fontSize: 9.25,
    lineHeight: 1.28,
    textAlign: 'justify',
  },
  currentBullets: {
    position: 'absolute',
    top: 570,
    left: 45,
    width: 430,
  },
  achievementRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 13,
    fontSize: 9.5,
    lineHeight: 1.27,
  },
  achievementText: {
    flex: 1,
    fontSize: 9.15,
    lineHeight: 1.27,
    textAlign: 'justify',
  },
  calloutRail: {
    position: 'absolute',
    top: 558,
    left: 489,
    width: 72,
  },
  callout: {
    height: 43,
    backgroundColor: STEEL,
    color: 'white',
    fontSize: 9.1,
    lineHeight: 1.16,
    textAlign: 'center',
    paddingTop: 7,
    paddingHorizontal: 3,
    marginBottom: 9,
  },
  calloutDark: {
    backgroundColor: STEEL_DARK,
  },
  pageTwo: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    color: INK,
    fontSize: 9.4,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 13,
  },
  continuationBar: {
    height: 24,
    backgroundColor: NAVY,
    borderWidth: 0.7,
    borderColor: '#AAB8C7',
    color: 'white',
    fontSize: 10.8,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
    paddingTop: 5.2,
    textTransform: 'uppercase',
    marginBottom: 11,
  },
  job: {
    marginBottom: 10,
  },
  company: {
    fontSize: 9.5,
    fontWeight: 'bold',
    letterSpacing: 0.7,
    lineHeight: 1.15,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 1.2,
    textAlign: 'center',
    marginBottom: 6,
  },
  simpleItem: {
    fontSize: 9.2,
    lineHeight: 1.3,
    marginBottom: 3,
  },
})

const stripHTML = (text?: string): string => {
  if (!text) return ''
  return text
    .replace(/<\/?strong>/g, '')
    .replace(/^•\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const truncate = (text: string, limit: number): string => {
  const clean = stripHTML(text)
  if (clean.length <= limit) return clean
  const sliced = clean.slice(0, limit - 1)
  const lastSpace = sliced.lastIndexOf(' ')
  return `${sliced.slice(0, lastSpace > 40 ? lastSpace : limit - 1).trim()}...`
}

const compact = (items?: string[], limit = 0, charLimit = 0): string[] => {
  const cleaned = (items || []).map(stripHTML).filter(Boolean)
  const limited = limit > 0 ? cleaned.slice(0, limit) : cleaned
  return charLimit > 0 ? limited.map((item) => truncate(item, charLimit)) : limited
}

const normalizeTitle = (title: string): string => {
  if (!title) return 'Business Leader'
  const clean = stripHTML(title)
  if (clean.length <= 27) return clean

  const lower = clean.toLowerCase()
  if (lower.includes('customer') || lower.includes('contact center') || lower.includes('client service')) {
    return 'Customer Experience Leader'
  }
  if (lower.includes('human resources') || lower.includes('people') || lower.includes('talent')) {
    return 'Human Resources Leader'
  }
  if (lower.includes('operation')) return 'Operations Leader'
  if (lower.includes('sales') || lower.includes('revenue')) return 'Sales Leader'
  if (lower.includes('technology') || lower.includes('digital')) return 'Technology Leader'
  return 'Business Leader'
}

const titleSize = (title: string): number => {
  const length = normalizeTitle(title).length
  if (length > 24) return 16
  if (length > 19) return 17.5
  return 20.5
}

const formatCompany = (job: Job): string => (
  [job.company, job.location, job.dates].map(stripHTML).filter(Boolean).join(' • ')
)

const BulletList = ({
  items,
  limit = 3,
  charLimit = 180,
}: {
  items: string[],
  limit?: number,
  charLimit?: number,
}) => (
  <>
    {compact(items, limit, charLimit).map((item, idx) => (
      <View key={idx} style={styles.achievementRow} wrap={false}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.achievementText}>{item}</Text>
      </View>
    ))}
  </>
)

const ContinuationJob = ({ job, index }: { job: Job, index: number }) => (
  <View style={styles.job} wrap={false}>
    <Text style={styles.company}>{truncate(formatCompany(job), 100)}</Text>
    <Text style={styles.jobTitle}>{truncate(job.title, 95)}</Text>
    <BulletList
      items={job.achievements || []}
      limit={index === 0 ? 3 : 2}
      charLimit={175}
    />
  </View>
)

const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => {
  const expertise = compact(data.expertise, 19, 38)
  const highlights = compact(data.career_highlights, 5, 145)
  const sideTags = compact(
    data.key_competencies?.length ? data.key_competencies : data.skill_categories,
    4,
    30
  )
  const previousJobs = data.previous_jobs || []
  const headline = normalizeTitle(data.current_title)

  return (
    <Document>
      <Page size="LETTER" style={styles.pageOne}>
        <View style={styles.banner} wrap={false}>
          <View style={styles.namePlate} wrap={false}>
            <Text style={styles.name}>{truncate(data.name, 34)}</Text>
          </View>
          <Text style={styles.contact}>
            {truncate(
              [data.location, data.email, data.phone].map(stripHTML).filter(Boolean).join(' • '),
              92
            )}
          </Text>
        </View>

        <View style={styles.expertisePanel} wrap={false}>
          <Text style={styles.expertiseTitle}>Areas of Expertise</Text>
          {expertise.map((skill, idx) => (
            <Text key={idx} style={styles.expertiseItem}>{skill}</Text>
          ))}
        </View>

        <View style={styles.profileMain} wrap={false}>
          <Text style={[styles.executiveTitle, { fontSize: titleSize(headline) }]}>{headline}</Text>
          {data.tagline && (
            <Text style={styles.tagline}>{truncate(data.tagline, 155)}</Text>
          )}
          <Text style={styles.summary}>{truncate(data.summary, 610)}</Text>
          {highlights.map((highlight, idx) => (
            <View key={idx} style={styles.highlightRow} wrap={false}>
              <View style={styles.highlightRule} />
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionBar}>Professional Experience</Text>
        <Text style={styles.currentCompany}>{truncate(formatCompany(data.current_job), 100)}</Text>
        <Text style={styles.currentTitle}>{truncate(data.current_job.title, 100)}</Text>
        {data.current_job.description && (
          <Text style={styles.currentDescription}>
            {truncate(data.current_job.description, 510)}
          </Text>
        )}

        <View style={styles.currentBullets} wrap={false}>
          <BulletList items={data.current_job.achievements || []} limit={3} charLimit={185} />
        </View>

        <View style={styles.calloutRail} wrap={false}>
          {sideTags.map((tag, idx) => (
            <Text key={idx} style={[styles.callout, idx < 2 ? styles.calloutDark : {}]}>
              {tag}
            </Text>
          ))}
        </View>
      </Page>

      {(previousJobs.length > 0 || data.early_career?.length > 0 || data.education?.length > 0) && (
        <Page size="LETTER" style={styles.pageTwo}>
          <View style={styles.pageHeader} fixed>
            <Text>{truncate(data.name, 45)}</Text>
            <Text>PAGE 2</Text>
          </View>

          <Text style={styles.continuationBar}>Professional Experience</Text>
          {previousJobs.map((job, idx) => (
            <ContinuationJob key={idx} job={job} index={idx} />
          ))}

          {data.early_career?.length > 0 && (
            <>
              <Text style={styles.continuationBar}>Early Career</Text>
              {compact(data.early_career, 3, 125).map((item, idx) => (
                <Text key={idx} style={styles.simpleItem}>{item}</Text>
              ))}
            </>
          )}

          {data.education?.length > 0 && (
            <>
              <Text style={styles.continuationBar}>Education & Professional Development</Text>
              {compact(data.education, 5, 135).map((item, idx) => (
                <Text key={idx} style={styles.simpleItem}>{item}</Text>
              ))}
            </>
          )}
        </Page>
      )}
    </Document>
  )
}

export default ResumePDF
