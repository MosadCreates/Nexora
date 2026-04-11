import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle
} from '@react-pdf/renderer';
import { AnalysisReport } from '../../types';

// Premium Tech SaaS Theme
const colors = {
  background: '#ffffff',
  surface: '#f8fafc', // slate-50
  surfaceLight: '#f1f5f9', // slate-100
  primary: '#1e1b4b', // Deep Indigo
  secondary: '#2563eb', // Electric Blue
  accent: '#0ea5e9', // Sky blue
  warning: '#f59e0b', // amber-500
  critical: '#ef4444', // red-500
  text: '#0f172a', // slate-900
  textSecondary: '#334155', // slate-700
  textMuted: '#64748b', // slate-500
  border: '#e2e8f0', // slate-200
  divider: '#f1f5f9' // slate-100
};

// Larger baseline fonts for Mobile View legibility (12pt base instead of 10pt)
const styles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 70,
    paddingHorizontal: 40,
    backgroundColor: colors.background,
    fontFamily: 'Helvetica',
    color: colors.text
  },
  coverPage: {
    padding: 0,
    backgroundColor: '#0f172a', // Deep elegant dark for cover to maintain impact
    color: '#ffffff',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    fontFamily: 'Helvetica'
  },
  coverContent: {
    padding: 60,
    flex: 1,
    justifyContent: 'center'
  },
  coverBrand: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 24,
    fontFamily: 'Helvetica-Bold'
  },
  coverTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 1.2,
    fontFamily: 'Helvetica-Bold'
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#cbd5e1',
    marginBottom: 60,
    lineHeight: 1.4
  },
  coverInfoBlock: {
    marginTop: 40,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    paddingLeft: 24
  },
  coverInfoItem: {
    marginBottom: 16
  },
  coverInfoLabel: {
    fontSize: 10,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold'
  },
  coverInfoValue: {
    fontSize: 14,
    color: '#f8fafc',
    fontFamily: 'Helvetica-Bold'
  },
  header: {
    position: 'absolute',
    top: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: colors.surfaceLight,
    paddingBottom: 12
  },
  headerLogoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontSize: 10,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontFamily: 'Helvetica-Bold'
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Helvetica'
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1.5,
    borderTopColor: colors.surfaceLight,
    paddingTop: 12
  },
  footerText: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  section: {
    marginBottom: 30
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary, // Deep Indigo accent
    paddingBottom: 8
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: 'Helvetica-Bold'
  },
  sectionNumber: {
    fontSize: 16,
    color: colors.secondary,
    marginRight: 12,
    fontFamily: 'Helvetica-Bold'
  },
  h3: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold'
  },
  paragraph: {
    fontSize: 12, // Increased for mobile legibility
    lineHeight: 1.6,
    color: colors.textSecondary,
    marginBottom: 10
  },
  mono: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: colors.secondary
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000', // React PDF dropshadow support is limited, but keeping structured approach
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 }
  },
  gridRowAlt: {
    backgroundColor: colors.surface
  },
  gridRowBase: {
    backgroundColor: colors.background
  },
  highlightBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    padding: 16,
    borderRadius: 10,
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  col: {
    flex: 1
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    alignSelf: 'flex-start'
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4
  },
  bulletPoint: {
    width: 16,
    fontSize: 12,
    color: colors.secondary,
    fontFamily: 'Helvetica-Bold'
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8
  },
  tableCol1: { width: '40%' },
  tableCol2: { width: '40%' },
  tableCol3: { width: '20%' },
  tableHeaderText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.textMuted,
    textTransform: 'uppercase'
  }
});

// Minimalist Flat Vector Accent Logo
const NexoraLogo = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill="none" stroke={colors.secondary} strokeWidth="2.5" />
    <Path d="M12 6 L16 12 L12 18 L8 12 Z" fill={colors.primary} />
    <Circle cx="12" cy="12" r="2.5" fill="#ffffff" />
  </Svg>
);

const AbstractPatternCover = () => (
  <Svg
    style={{ position: 'absolute', top: 0, right: 0, width: 500, height: 500, opacity: 0.15 }}
    viewBox="0 0 400 400"
  >
    <Circle cx="300" cy="100" r="4" fill={colors.secondary} />
    <Circle cx="350" cy="150" r="2" fill={colors.secondary} />
    <Circle cx="250" cy="180" r="6" fill={colors.accent} />
    <Circle cx="320" cy="250" r="3" fill={colors.secondary} />
    <Path
      d="M300 100 Q 320 120 350 150 T 250 180 T 320 250"
      fill="none"
      stroke={colors.secondary}
      strokeWidth="2"
    />
  </Svg>
);

interface AnalysisPDFProps {
  report: AnalysisReport;
  query?: string;
}

const AnalysisPDF: React.FC<AnalysisPDFProps> = ({ report, query = 'Market Intelligence' }) => {
  const generatedTimestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const renderBadge = (text: string, level: 'high' | 'medium' | 'low') => {
    let bg = colors.surfaceLight;
    let fg = colors.textMuted;
    
    if (level === 'high') {
      bg = '#fee2e2'; // red-100
      fg = colors.critical;
    } else if (level === 'medium') {
      bg = '#fef3c7'; // amber-100
      fg = colors.warning;
    } else if (level === 'low') {
      bg = '#e0f2fe'; // sky-100
      fg = colors.secondary;
    }
    
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={{ color: fg }}>{text}</Text>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.coverPage}>
        <AbstractPatternCover />
        <View style={styles.coverContent}>
          <Text style={styles.coverBrand}>Nexora OS</Text>
          <Text style={styles.coverTitle}>Strategic Analysis Report</Text>
          <Text style={styles.coverSubtitle}>Deep Context & Market Intelligence</Text>

          <View style={styles.coverInfoBlock}>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Target Subject</Text>
              <Text style={styles.coverInfoValue}>{query}</Text>
            </View>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Report Timestamp</Text>
              <Text style={styles.coverInfoValue}>{generatedTimestamp}</Text>
            </View>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Generated By</Text>
              <Text style={styles.coverInfoValue}>Nexora Primary Engine</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* Main Content Pages with dynamic wrapping */}
      <Page size="A4" style={styles.page} wrap={true}>
        
        {/* Abstract Header */}
        <View style={styles.header} fixed>
          <View style={styles.headerLogoGroup}>
            <NexoraLogo />
            <Text style={styles.headerTitle}>NEXORA INTELLIGENCE</Text>
          </View>
          <Text style={styles.headerSubtitle}>{query}</Text>
        </View>

        {/* Executive Summary */}
        {/* wrap={false} here because Executive Summary is usually short enough to fit one page entirely */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>01</Text>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
          </View>

          <View style={styles.highlightBox}>
            <Text style={[styles.h3, { color: colors.primary }]}>Core Strategic Insight</Text>
            <Text style={styles.paragraph}>{report.executiveSummary}</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.col]}>
              <Text style={styles.coverInfoLabel}>Market Signal</Text>
              <Text style={[styles.h3, { color: colors.secondary, marginBottom: 0 }]}>Strong</Text>
            </View>
            <View style={[styles.card, styles.col]}>
              <Text style={styles.coverInfoLabel}>Growth Potential</Text>
              <Text style={[styles.h3, { color: colors.primary, marginBottom: 0 }]}>High Expansion</Text>
            </View>
            <View style={[styles.card, styles.col]}>
              <Text style={styles.coverInfoLabel}>Risk Index</Text>
              <Text style={[styles.h3, { color: colors.warning, marginBottom: 0 }]}>Moderate</Text>
            </View>
          </View>
        </View>

        {/* Market Signals - "Wall of Text" capable */}
        {/* The section itself is wrap={true} so it breaks nicely. Indiv cards wrap={true} to handle walls of text */}
        <View style={styles.section} wrap={true}>
          <View style={styles.sectionHeader} wrap={false}>
            <Text style={styles.sectionNumber}>02</Text>
            <Text style={styles.sectionTitle}>Market Signals & Vulnerabilities</Text>
          </View>

          {report.weaknessMatrix.map((w, i) => (
            <View key={i} style={[styles.card, { paddingVertical: 20 }]} wrap={true}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'flex-start' }}>
                <Text style={[styles.h3, { flex: 1, paddingRight: 16 }]}>{w.name}</Text>
                {renderBadge(
                  `${w.frequency} Signal`, 
                  w.frequency === 'High' ? 'high' : w.frequency === 'Medium' ? 'medium' : 'low'
                )}
              </View>
              {/* This text could be very long ("Wall of Text") - wrap=true on parent allows page breaks */}
              <Text style={styles.paragraph}>{w.monetizationSignals}</Text>
              <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, padding: 8, borderRadius: 6 }}>
                <Text style={[styles.mono, { marginRight: 8, color: colors.primary }]}>Pain Intensity:</Text>
                <Text style={[styles.paragraph, { marginBottom: 0, fontWeight: 'bold', color: w.painIntensity === 'Severe' ? colors.critical : colors.warning }]}>
                  {w.painIntensity}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Opportunity Landscape Grid Table */}
        <View style={styles.section} wrap={true}>
          <View style={styles.sectionHeader} wrap={false}>
            <Text style={styles.sectionNumber}>03</Text>
            <Text style={styles.sectionTitle}>Opportunity Landscape</Text>
          </View>

          <View style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
            {/* Table Header */}
            <View style={[styles.row, { padding: 12, backgroundColor: colors.primary }]}>
              <Text style={[styles.tableCol1, styles.tableHeaderText, { color: '#ffffff' }]}>Opportunity</Text>
              <Text style={[styles.tableCol2, styles.tableHeaderText, { color: '#ffffff' }]}>Hypothesis</Text>
              <Text style={[styles.tableCol3, styles.tableHeaderText, { color: '#ffffff', textAlign: 'right' }]}>Score / Moat</Text>
            </View>
            
            {/* Table Rows */}
            {report.comparisonTable.map((row, i) => (
              <View 
                key={i} 
                style={[
                  styles.row, 
                  { padding: 12, borderTopWidth: 1, borderTopColor: colors.border },
                  i % 2 === 0 ? styles.gridRowBase : styles.gridRowAlt
                ]} 
                wrap={true}
              >
                <View style={styles.tableCol1}>
                  <Text style={[styles.h3, { fontSize: 12, marginBottom: 4 }]}>
                    {i === 0 ? '★ ' : ''}{row.weakness}
                  </Text>
                </View>
                <View style={styles.tableCol2}>
                  <Text style={styles.paragraph}>{row.whyBuildThis}</Text>
                </View>
                <View style={[styles.tableCol3, { alignItems: 'flex-end' }]}>
                  <View style={[styles.badge, { backgroundColor: colors.secondary, marginBottom: 8 }]}>
                    <Text style={{ color: '#fff' }}>Score: {row.opportunityScore}/5</Text>
                  </View>
                  <Text style={[styles.coverInfoLabel, { fontSize: 8, marginBottom: 2 }]}>Moat</Text>
                  <Text style={[styles.mono, { textAlign: 'right' }]}>{row.moat}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* AI STRATEGIC RECOMMENDATIONS */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>04</Text>
            <Text style={styles.sectionTitle}>Strategic Recommendations</Text>
          </View>

          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
            <Text style={styles.coverInfoLabel}>Primary Opportunity Vector</Text>
            <Text style={[styles.paragraph, { color: colors.text, marginTop: 4, fontWeight: 'bold' }]}>
              {report.strategicRecommendations.strongestOpportunity}
            </Text>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.card, styles.col, { borderLeftWidth: 4, borderLeftColor: colors.secondary }]}>
              <Text style={styles.coverInfoLabel}>Quick Win Alternative</Text>
              <Text style={[styles.paragraph, { marginTop: 4 }]}>
                {report.strategicRecommendations.quickWinAlternative}
              </Text>
            </View>
            <View style={[styles.card, styles.col, { borderLeftWidth: 4, borderLeftColor: colors.warning }]}>
              <Text style={styles.coverInfoLabel}>Critical Risk Advisory</Text>
              <Text style={[styles.paragraph, { marginTop: 4 }]}>
                {report.strategicRecommendations.redFlags}
              </Text>
            </View>
          </View>
        </View>

        {/* VALIDATION & NEXT STEPS */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>05</Text>
            <Text style={styles.sectionTitle}>Actionable Next Steps</Text>
          </View>

          <View style={[styles.card, { padding: 20 }]}>
            {report.validationNextSteps.map((step, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>{(i + 1).toString().padStart(2, '0')}.</Text>
                <Text style={[styles.paragraph, { flex: 1, marginBottom: 0 }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Professional Timestamped Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Nexora OS: {generatedTimestamp}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} />
        </View>

      </Page>
    </Document>
  );
};

export default AnalysisPDF;
