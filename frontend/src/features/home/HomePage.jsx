import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import PageShell from '../../components/layout/PageShell';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import ChatSection from '../../components/layout/ChatSection';
import TopicsPanel from '../../components/layout/TopicsPanel';

export default function HomePage() {
  const shouldReduce = useReducedMotion();

  return (
    <PageShell>
      <Header />
      <motion.div
        {...(shouldReduce ? {} : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.35, delay: 0.15 },
        })}
        className="flex h-[calc(100vh-3rem)]"
      >
        <Sidebar />
        <ChatSection />
        <TopicsPanel />
      </motion.div>
    </PageShell>
  );
}
