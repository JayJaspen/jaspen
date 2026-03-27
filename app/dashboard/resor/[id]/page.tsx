import AlbumDetailPage from '@/components/AlbumDetailPage'

export default async function ResaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <AlbumDetailPage
      albumId={id}
      basePath="/dashboard/resor"
      backLabel="Resor & äventyr"
    />
  )
}
