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
const INK = '#111111'

const styles = StyleSheet.create({
  page: {
    paddingTop: 31,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    color: INK,
  },
  banner: {
    height: 70,
    backgroundColor: NAVY,
    borderWidth: 1,
    borderColor: '#B8C3D0',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 18,
  },
  namePlate: {
    width: 232,
    height: 34,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  name: {
    color: NAVY,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  contact: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  profileRegion: {
    height: 384,
    flexDirection: 'row',
    marginBottom: 14,
  },
  expertisePanel: {
    width: 162,
    height: 380,
    backgroundColor: LIGHT_BLUE,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  expertiseTitle: {
    fontSize: 9.2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  expertiseItem: {
    fontSize: 10,
    lineHeight: 1.38,
    textAlign: 'center',
    marginBottom: 1.6,
  },
  profileMain: {
    flex: 1,
    paddingLeft: 8,
  },
  executiveTitle: {
    color: COPPER,
    fontSize: 21,
    fontWeight: 'bold',
    letterSpacing: 1.8,
    lineHeight: 1.05,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 10.2,
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 1.35,
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 13,
  },
  summary: {
    fontSize: 10.15,
    lineHeight: 1.55,
    textAlign: 'justify',
    marginBottom: 16,
  },
  highlightRow: {
    flexDirection: 'row',
    marginBottom: 5.2,
  },
  highlightRule: {
    width: 21,
    borderTopWidth: 1,
    borderTopColor: COPPER,
    marginTop: 6,
    marginRight: 9,
  },
  highlightText: {
    flex: 1,
    color: COPPER,
    fontSize: 9.8,
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 1.32,
  },
  sectionBar: {
    height: 27,
    backgroundColor: NAVY,
    borderWidth: 1,
    borderColor: '#B8C3D0',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    paddingTop: 6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  firstExperience: {
    position: 'relative',
    minHeight: 300,
  },
  firstExperienceText: {
    paddingHorizontal: 2,
    paddingRight: 138,
  },
  continuationExperience: {
    paddingHorizontal: 1,
  },
  job: {
    marginBottom: 11,
  },
  company: {
    fontSize: 10.3,
    fontWeight: 'bold',
    letterSpacing: 1.7,
    lineHeight: 1.15,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 10.2,
    fontWeight: 'bold',
    fontStyle: 'italic',
    lineHeight: 1.2,
    textAlign: 'center',
    marginBottom: 8,
  },
  jobDesc: {
    fontSize: 10.1,
    lineHeight: 1.31,
    textAlign: 'justify',
    marginBottom: 5,
  },
  achievementRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 9,
  },
  bullet: {
    width: 13,
    fontSize: 10,
    lineHeight: 1.25,
  },
  achievementText: {
    flex: 1,
    fontSize: 9.95,
    lineHeight: 1.3,
    textAlign: 'justify',
  },
  calloutRail: {
    position: 'absolute',
    right: 17,
    top: 128,
    width: 88,
  },
  callout: {
    minHeight: 44,
    backgroundColor: STEEL,
    color: 'white',
    fontSize: 10,
    lineHeight: 1.18,
    textAlign: 'center',
    paddingTop: 8,
    paddingHorizontal: 5,
    marginBottom: 11,
  },
  calloutDark: {
    backgroundColor: '#5E83BA',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: -6,
    marginBottom: 14,
  },
  simpleSection: {
    marginTop: 5,
  },
  simpleItem: {
    fontSize: 9.6,
    lineHeight: 1.35,
    marginBottom: 4,
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
  return `${sliced.slice(0, lastSpace > 80 ? lastSpace : limit - 1).trim()}.`
}

const compact = (items?: string[], limit = 0, charLimit = 0): string[] => {
  const cleaned = (items || []).map(stripHTML).filter(Boolean)
  const limited = limit > 0 ? cleaned.slice(0, limit) : cleaned
  return charLimit > 0 ? limited.map((item) => truncate(item, charLimit)) : limited
}

const normalizeTitle = (title: string): string => {
  if (!title) return 'Business Leader'
  const clean = stripHTML(title)
  if (clean.length <= 26) return clean

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

const formatCompany = (job: Job): string => (
  [job.company, job.location, job.dates].map(stripHTML).filter(Boolean).join(' • ')
)

const BulletList = ({ items, limit = 3, charLimit = 190 }: { items: string[], limit?: number, charLimit?: number }) => (
  <>
    {compact(items, limit, charLimit).map((item, idx) => (
      <View key={idx} style={styles.achievementRow}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.achievementText}>{item}</Text>
      </View>
    ))}
  </>
)

const JobBlock = ({
  job,
  descriptionLimit = 560,
  bulletLimit = 3,
  bulletCharLimit = 190,
}: {
  job: Job,
  descriptionLimit?: number,
  bulletLimit?: number,
  bulletCharLimit?: number,
}) => (
  <View style={styles.job}>
    <Text style={styles.company}>{formatCompany(job)}</Text>
    <Text style={styles.jobTitle}>{truncate(job.title, 95)}</Text>
    {job.description && descriptionLimit > 0 && (
      <Text style={styles.jobDesc}>{truncate(job.description, descriptionLimit)}</Text>
    )}
    <BulletList items={job.achievements || []} limit={bulletLimit} charLimit={bulletCharLimit} />
  </View>
)

const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => {
  const expertise = compact(data.expertise, 19, 34)
  const highlights = compact(data.career_highlights, 5, 150)
  const sideTags = compact(data.key_competencies?.length ? data.key_competencies : data.skill_categories, 4, 28)
  const previousJobs = data.previous_jobs || []

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.banner}>
          <View style={styles.namePlate}>
            <Text style={styles.name}>{truncate(data.name, 30)}</Text>
          </View>
          <Text style={styles.contact}>
            {truncate([data.location, data.email, data.phone].map(stripHTML).filter(Boolean).join(' • '), 90)}
          </Text>
        </View>

        <View style={styles.profileRegion}>
          <View style={styles.expertisePanel}>
            <Text style={styles.expertiseTitle}>Areas of Expertise</Text>
            {expertise.map((skill, idx) => (
              <Text key={idx} style={styles.expertiseItem}>{skill}</Text>
            ))}
          </View>

          <View style={styles.profileMain}>
            <Text style={styles.executiveTitle}>{normalizeTitle(data.current_title)}</Text>
            {data.tagline && (
              <Text style={styles.tagline}>{truncate(data.tagline, 150)}</Text>
            )}
            <Text style={styles.summary}>{truncate(data.summary, 690)}</Text>
            {highlights.map((highlight, idx) => (
              <View key={idx} style={styles.highlightRow}>
                <View style={styles.highlightRule} />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionBar}>Professional Experience</Text>
        <View style={styles.firstExperience}>
          <View style={styles.firstExperienceText}>
            <JobBlock
              job={data.current_job}
              descriptionLimit={720}
              bulletLimit={3}
              bulletCharLimit={210}
            />
          </View>
          {sideTags.length > 0 && (
            <View style={styles.calloutRail}>
              {sideTags.map((tag, idx) => (
                <Text key={idx} style={[styles.callout, idx < 2 ? styles.calloutDark : {}]}>
                  {tag}
                </Text>
              ))}
            </View>
          )}
        </View>
      </Page>

      {(previousJobs.length > 0 || data.early_career?.length > 0 || data.education?.length > 0) && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.pageHeader}>
            <Text>{truncate(data.name, 45)}</Text>
            <Text>PAGE 2</Text>
          </View>

          <Text style={styles.sectionBar}>Professional Experience</Text>
          <View style={styles.continuationExperience}>
            {previousJobs.map((job, idx) => (
              <JobBlock
                key={idx}
                job={job}
                descriptionLimit={idx === 0 ? 260 : 0}
                bulletLimit={idx === 0 ? 3 : 2}
                bulletCharLimit={175}
              />
            ))}
          </View>

          {data.early_career?.length > 0 && (
            <View style={styles.simpleSection}>
              <Text style={styles.sectionBar}>Early Career</Text>
              {compact(data.early_career, 3, 120).map((item, idx) => (
                <Text key={idx} style={styles.simpleItem}>{item}</Text>
              ))}
            </View>
          )}

          {data.education?.length > 0 && (
            <View style={styles.simpleSection}>
              <Text style={styles.sectionBar}>Education & Professional Development</Text>
              {compact(data.education, 5, 130).map((item, idx) => (
                <Text key={idx} style={styles.simpleItem}>{item}</Text>
              ))}
            </View>
          )}
        </Page>
      )}
    </Document>
  )
}

export default ResumePDF
