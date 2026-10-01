import { useCallback, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout';
import AddDialog from '@/components/AddDialog';
import Today from '@/pages/Today';
import VaultPage from '@/pages/Vault';
import ItemPage from '@/pages/ItemPage';
import Guide from '@/pages/Guide';
import { useVault } from '@/lib/store';

function NotFound() {
  return (
    <div className="card fade-in">
      <div className="empty">
        <div className="empty-ico" aria-hidden="true">404</div>
        <h3>Page not found</h3>
        <p>That route does not exist in NIVA.</p>
        <Link to="/" className="btn btn-primary">
          Back to Today
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const vault = useVault();
  const [adding, setAdding] = useState(false);
  const openAdd = useCallback(() => setAdding(true), []);

  return (
    <Layout vault={vault} onAdd={openAdd}>
      <Routes>
        <Route path="/" element={<Today vault={vault} onAdd={openAdd} />} />
        <Route path="/vault" element={<VaultPage vault={vault} onAdd={openAdd} />} />
        <Route path="/item/:id" element={<ItemPage vault={vault} />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {adding && (
        <AddDialog
          onClose={() => setAdding(false)}
          onSave={(d) => {
            vault.add(d);
            setAdding(false);
          }}
        />
      )}
    </Layout>
  );
}
