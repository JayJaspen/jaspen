import AlbumDetailPage from '@/components/AlbumDetailPage'

export default async function FodelsedagDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <AlbumDetailPage
      albumId={id}
      basePath="/dashboard/fodelsedagar"
      backLabel="Födelsedagar & fest"
    />
  )
}
