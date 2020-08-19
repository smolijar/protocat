import React from 'react'
import clsx from 'clsx'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './styles.module.css'

const features = [
  {
    title: <>Delightfuly typesafe</>,
    imageUrl: 'img/feat-types.svg',
    description: (
      <>
        Supreme TypeScript support for all gRPC call types, advanced type
        inference from generated code.
      </>
    ),
  },
  {
    title: <>Solid foundation</>,
    imageUrl: 'img/feat-foundation.svg',
    description: (
      <>
        Modern small TypeScript codebase, with unit and integration tests.
        Protocat uses new pure JavaScript gRPC client <code>@grpc/grpc-js</code>
        .
      </>
    ),
  },
  {
    title: <>Modern middleware interface</>,
    imageUrl: 'img/feat-mdw.svg',
    description: (
      <>
        Async middleware API with awaitable call stack cascade. Basic
        functionality like composition and on-error middleware.
      </>
    ),
  },
]

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl)
  return (
    <div className={clsx('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function Home() {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context
  return (
    <Layout
      title={`${siteConfig.title}: ${siteConfig.tagline}`}
      description={siteConfig.tagline}
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <img src="img/logo-alt.svg" style={{ maxWidth: '350px' }}></img>
          <div className={styles.buttons}>
            <Link
              className={clsx(
                'button button--outline button--primary button--lg',
                styles.getStarted
              )}
              to={useBaseUrl('docs/wiki/installation')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  )
}

export default Home
