import { notFound } from 'next/navigation';
import { Descent } from '../../page';
import { PROJECTS } from '@/content/projects';
import { ROUTES } from '@/content/routes';

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = ROUTES.find((r) => r.path === `/project/${slug}`);
  if (!route) return {};
  return { title: route.title, description: route.description };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!PROJECTS.some((p) => p.slug === slug)) notFound();
  return <Descent />;
}
