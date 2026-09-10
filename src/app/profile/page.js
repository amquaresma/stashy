import { createClient } from '@/lib/supabase/server'
import ProfileForm from './profile-form'
import AvatarUploader from './avatar-uploader'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('display_name, username, bio, age, avatar_url')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('[ProfilePage] erro ao buscar profile:', error)
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 gap-6">
      <AvatarUploader
        initialAvatarUrl={profile?.avatar_url}
        displayName={profile?.display_name}
      />
      <ProfileForm initialProfile={profile} userId={user.id} />
    </div>
  )
}
