import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

import DatePicker from '@site/src/components/DatePicker';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title project-font">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/documentations/intro"
          >
            Getting Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout description="Pure (vanilla) javascript datepicker">
      <HomepageHeader />
      <main>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DatePicker options={{ inline: true, selectedDate: new Date() }} />
        </div>
      </main>
    </Layout>
  );
}
