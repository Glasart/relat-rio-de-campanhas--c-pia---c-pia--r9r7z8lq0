import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const githubToken = Deno.env.get('GITHUB_TOKEN') || ''

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase credentials' }), { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch the data
    const { data: campanhas, error: errC } = await supabase
      .from('performance_campanha')
      .select('*')
      .order('ordem', { ascending: true })

    if (errC) throw errC

    if (!githubToken) {
      console.warn('GITHUB_TOKEN is not set. Data was fetched but not pushed to GitHub.')
      return new Response(JSON.stringify({ success: true, message: 'Data fetched, but GitHub sync skipped (No Token)' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const content = JSON.stringify(campanhas, null, 2)
    // Convert string to base64 properly handling unicode
    const encodedContent = btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode(Number('0x' + p1));
      }));

    const repoOwner = 'Glasart'
    const repoName = 'relatoriocampanhas'
    const filePath = 'data/performance_campanha.json'
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`

    // Get current file to find its SHA (required for updates)
    const getRes = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'User-Agent': 'Supabase-Edge-Function',
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    let sha = undefined
    if (getRes.ok) {
      const fileData = await getRes.json()
      sha = fileData.sha
    }

    // Push file to GitHub
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'User-Agent': 'Supabase-Edge-Function',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Auto-sync: Performance de Campanha (${new Date().toISOString()})`,
        content: encodedContent,
        sha: sha,
        branch: 'main'
      })
    })

    if (!putRes.ok) {
      const errorBody = await putRes.text()
      throw new Error(`GitHub API Error: ${putRes.status} ${errorBody}`)
    }

    return new Response(JSON.stringify({ success: true, message: 'Successfully synced to GitHub' }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('GitHub Sync Error:', error.message)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
