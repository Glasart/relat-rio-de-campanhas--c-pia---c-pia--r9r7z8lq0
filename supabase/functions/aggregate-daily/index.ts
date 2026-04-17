import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: 'Configuração de ambiente ausente' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { data: diarios, error: errFetch } = await supabase.from('dados_diarios').select('*')
    if (errFetch) throw errFetch

    if (!diarios || diarios.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum dado diário encontrado para agregar' }),
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }

    const agregados: Record<string, number> = {}
    diarios.forEach((d) => {
      const key = `${d.usuario_id}|${d.metrica_nome}`
      agregados[key] = (agregados[key] || 0) + Number(d.valor)
    })

    let count = 0
    for (const [key, valor] of Object.entries(agregados)) {
      const [usuario_id, metrica_nome] = key.split('|')

      const { error: insErr } = await supabase.from('dados_consolidados').insert({
        usuario_id,
        periodo: 'diario_agregado',
        metrica_nome,
        valor_total: valor,
      })
      if (insErr) console.error('Erro ao inserir consolidado:', insErr)
      else count++
    }

    return new Response(
      JSON.stringify({ success: true, message: `Foram gerados ${count} registros consolidados.` }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
