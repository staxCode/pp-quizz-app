export async function POST(request: Request) {
  void request
  return Response.json(
    { error: 'User creation is disabled. Only login is available.' },
    { status: 403 }
  )
}
