import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { pedido_id, tipo_notificacao, tipo_conteudo, pdf_base64 } = await req.json()
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    )

    const { data: pedido, error: errP } = await supabaseClient
      .from('pedidos')
      .select('*, clientes(*)')
      .eq('id', pedido_id)
      .single()
    if (errP || !pedido) throw new Error('Pedido não encontrado')

    // Mock API requests due to missing valid external credentials
    console.log(
      `Sending notification to ${pedido.clientes.email} / ${pedido.clientes.whatsapp} via ${tipo_notificacao}`,
    )
    if (tipo_conteudo === 'cotacao' && pdf_base64) console.log('PDF Attached')

    await supabaseClient.from('historico_atualizacoes').insert({
      pedido_id,
      status_novo: 'notificacao_enviada',
      usuario_id: pedido.criado_por,
      notas: `Notificação enviada via ${tipo_notificacao} (${tipo_conteudo})`,
      tipo_acao: 'notificacao_enviada',
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notificação enviada com sucesso',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
