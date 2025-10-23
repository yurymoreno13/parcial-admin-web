import React, {useEffect, useState} from 'react'
import { createRoot } from 'react-dom/client'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function Login({onAuth}){
  const [email,setEmail]=useState('admin@demo.com')
  const [password,setPassword]=useState('admin123')
  const go = async ()=>{
    const res = await fetch(API+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
    const data = await res.json()
    if(data.role!=='admin') return alert('Solo admin')
    if(data.token){ localStorage.setItem('admintoken', data.token); onAuth(true) }
    else alert(data.error||'Error')
  }
  return <div className="wrap">
    <div className="card" style={{maxWidth:420, margin:'48px auto'}}>
      <h2>Admin Login</h2>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} /><br/>
      <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} /><br/>
      <button onClick={go}>Entrar</button>
    </div>
  </div>
}

function useToken(){
  const [token,setToken]=useState(localStorage.getItem('admintoken')||null)
  return {token, setToken}
}

function Dashboard(){
  const {token}=useToken()
  const [products,setProducts]=useState([])
  const [orders,setOrders]=useState([])
  const [title,setTitle]=useState('')
  const [price,setPrice]=useState(0)
  const [image,setImage]=useState('')

  const authHead = { 'Authorization':'Bearer '+token, 'Content-Type':'application/json' }

  const load = async ()=>{
    const ps = await fetch(API+'/api/products/all',{headers:authHead}).then(r=>r.json())
    setProducts(ps)
    const os = await fetch(API+'/api/orders',{headers:authHead}).then(r=>r.json())
    setOrders(os)
  }

  useEffect(()=>{ load() },[])

  const add = async ()=>{
    const res = await fetch(API+'/api/products',{method:'POST',headers:authHead,body:JSON.stringify({title,price:Number(price),image,active:true})})
    if(res.ok){ setTitle('');setPrice(0);setImage(''); load() }
  }

  const toggleActive = async (p)=>{
    await fetch(API+'/api/products/'+p._id, {method:'PATCH', headers:authHead, body:JSON.stringify({active:!p.active})})
    load()
  }

  return <div className="wrap">
    <div className="card">
      <h2>Productos</h2>
      <div className="row">
        <input placeholder="Título" value={title} onChange={e=>setTitle(e.target.value)} />
        <input placeholder="Precio" value={price} onChange={e=>setPrice(e.target.value)} />
        <input placeholder="Imagen URL" value={image} onChange={e=>setImage(e.target.value)} />
        <button onClick={add}>Agregar</button>
      </div>
      <table>
        <thead><tr><th>Título</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {products.map(p=>(
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>${p.price}</td>
              <td><span className="pill">{p.active?'Activo':'Agotado'}</span></td>
              <td><button onClick={()=>toggleActive(p)}>{p.active?'Marcar agotado':'Activar'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="card">
      <h2>Dashboard de Ventas</h2>
      <p>Total pedidos: <strong>{orders.length}</strong></p>
      <table>
        <thead><tr><th>Usuario</th><th>Ítems</th><th>Total</th><th>Fecha</th></tr></thead>
        <tbody>
          {orders.map(o=>(
            <tr key={o._id}>
              <td>{o.user?.name} ({o.user?.email})</td>
              <td>{o.items.map(i=> i.product?.title+' x'+i.qty).join(', ')}</td>
              <td>${o.total}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
}

function App(){
  const [ok,setOk]=useState(!!localStorage.getItem('admintoken'))
  return ok? <Dashboard/> : <Login onAuth={setOk}/>
}

createRoot(document.getElementById('root')).render(<App/>)
