// frontend/pages/index.tsx
import { getSession, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  const { data: session } = useSession();

  if (!session) {
    return <div>You need to be authenticated to view this page.</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Home Page</title>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Pantry Management</h1>
      </main>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
