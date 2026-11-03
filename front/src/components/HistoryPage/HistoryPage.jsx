import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TablePagination
} from '@mui/material';
import styles from './HistoryPage.module.scss';
import gift from '../../assets/gift.png';
import ParticipationService from '../../service/participationService';
import PrizeService from '../../service/prizeService';
import Seo from '../../seo/Seo';


function formatDateFR(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function HistoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [partRes, prizeRes] = await Promise.all([
          ParticipationService.getMyParticipations(),
          PrizeService.getPrize(),
        ]);

        const participations = Array.isArray(partRes?.data) ? partRes.data : [];
        const prizes = Array.isArray(prizeRes?.data) ? prizeRes.data : [];
        const prizeMap = new Map(prizes.map((pr) => [Number(pr.id), pr.name]));

        const mapped = participations
          .sort((a, b) => new Date(b.participationDate) - new Date(a.participationDate))
          .map((p) => {
            const pid =
              (p?.ticket?.prizeId != null ? Number(p.ticket.prizeId) : undefined) ??
              (p?.ticket?.prize?.id != null ? Number(p.ticket.prize.id) : undefined) ??
              (p?.prizeId != null ? Number(p.prizeId) : undefined) ??
              (p?.prix != null ? Number(p.prix) : undefined);

            const prizeName =
              (pid != null ? prizeMap.get(pid) : undefined) ??
              (pid != null ? `Lot #${pid}` : (p?.ticket?.code ? `Ticket ${p.ticket.code}` : '—'));

            const remis = !!p?.ticket?.claims?.some(cl => cl.isDelivered === true);

            const code =
              p?.ticket?.code ??
              p?.code ??
              p?.ticketCode ??
              p?.ticket?.token ??
              null;

            return {
              id: p.id,
              date: formatDateFR(p.participationDate),
              lot: prizeName,
              remis,
              code: code || '—',
            };
          });

        if (mounted) setRows(mapped);
      } catch (e) {
        if (mounted) setErr(e?.response?.data?.message || 'Impossible de charger vos participations.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const total = rows.length;
  const paged = useMemo(
    () => rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [rows, page, rowsPerPage]
  );
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, total - page * rowsPerPage);

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <>
    <Seo
        title="Historique des gains — Espace client"
        description="Consultez la liste de vos participations et gains."
        path="/historique"
        noindex
        nofollow
      />
      <Box className={styles.container}>
      <Typography component="h1" className={styles.title}>
        Historique des gains
      </Typography>
      <Box className={styles.separator} />

      <Paper className={styles.paper}>
        {loading ? (
          <Typography sx={{ p: 2 }}>Chargement…</Typography>
        ) : err ? (
          <Typography color="error" sx={{ p: 2 }}>{err}</Typography>
        ) : total === 0 ? (
          <Typography sx={{ p: 2 }}>Aucune participation pour le moment.</Typography>
        ) : (
          <>
            <TableContainer>
              <Table className={styles.table}>
                <TableHead>
                  <TableRow>
                    {['Date', 'Code', 'Lot', 'Statut'].map((h) => (
                      <TableCell key={h} className={styles.tableHeaderCell}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.map((row) => (
                    <TableRow key={row.id} className={styles.tableRow}>
                      <TableCell className={styles.tableCell}>{row.date}</TableCell>
                      <TableCell className={styles.tableCell}>{row.code}</TableCell>
                      <TableCell className={styles.tableCell}>{row.lot}</TableCell>
                      <TableCell className={styles.tableCell}>
                        <span className={row.remis ? styles.statusRemis : styles.statusNonRemis}>
                          {row.remis ? 'Remis' : 'Non remis'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={4} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page :"
              className={styles.pagination}
            />
          </>
        )}
      </Paper>

      <Box className={styles.giftWrapper}>
        <img src={gift} alt="Cadeau" className={styles.gift} />
      </Box>
    </Box>
    
    </>
    
  );
}