const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupBuckets() {
  try {
    console.log('🔍 Verificando buckets existentes...')
    
    // Listar buckets existentes
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError)
      return
    }
    
    console.log('📋 Buckets existentes:', buckets.map(b => b.name))
    
    // Verificar si existe el bucket 'productos'
    const productsBucketExists = buckets.find(b => b.name === 'productos')
    
    if (!productsBucketExists) {
      console.log('🔧 Creando bucket "productos"...')
      
      const { error: createError } = await supabase.storage.createBucket('productos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 2097152, // 2MB
      })
      
      if (createError) {
        console.error('❌ Error creando bucket "productos":', createError)
      } else {
        console.log('✅ Bucket "productos" creado exitosamente')
      }
    } else {
      console.log('✅ Bucket "productos" ya existe')
    }
    
    // Verificar configuración del bucket existente
    console.log('🔍 Verificando configuración de buckets...')
    const { data: bucketConfig } = await supabase.storage.getBucket('productos')
    console.log('📋 Configuración bucket "productos":', bucketConfig)
    
  } catch (error) {
    console.error('💥 Error general:', error)
  }
}

setupBuckets()
