import { ethers } from 'ethers';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';
import { useEffect, useState } from 'react';
import axios  from 'axios';
import deploy from './deploy';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const provider = new ethers.providers.Web3Provider(window.ethereum);

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  function handleApproveClick(address) {
    return (e) => {
      e.preventDefault();
      approve(address);
    }
  }
  
  async function approve(address) {
    console.log("Approve adr: ", address);
    const signerAddr = await signer.getAddress();
    console.log("Signer: ", signerAddr);
    const escrowContract = new ethers.Contract(address, Escrow.abi, signer);
    const approveTxn = await escrowContract.approve();
    console.log(approveTxn);
    await approveTxn.wait();
    await axios.post('http://localhost:3000/approve', {
      address: escrowContract.address,
    })
    getEscrows();
  }

  async function getEscrows() {
    const resp = await axios.get('http://localhost:3000/');
    const escrows = resp.data;
    if (Object.keys(escrows).length !== 0) {
      setEscrows(escrows);
    }
  }

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);
      
      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
    console.log("Account: ", account);
    console.log("Provider: ", provider);
    getEscrows();
  }, [account]);

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const value = ethers.utils.parseEther(document.getElementById('amount').value);
    const note = document.getElementById('note').value;
    console.log("Signer:", signer);
    const escrowContract = await deploy(signer, arbiter, beneficiary, note, value);

    await axios.post('http://localhost:3000/new', {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      note,
      value: value.toString(),
    });

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      note,
      value: value.toString(),
      isApproved: false,
    };

    getEscrows()
  }

  return (
    <Box
      component="main"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[900],
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
      }}
    >
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Form */}
          <Grid item xs={12} sx={{ flexDirection: "column" }}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
              New Contract
    </Typography>
    <Box component="form" onSubmit={(e) => {
            e.preventDefault();
            newContract();
          }} noValidate sx={{ mt: 1 }}>
    <TextField
              margin="normal"
              required
              name="arbiter"
              label="Arbiter Address"
              id="arbiter"
              sx={{
                "minWidth": 300,
                "width": "30%",
                mr: 1,
              }}
              size='small'
            />
            <TextField
              margin="normal"
              required
              name="beneficiary"
              label="Beneficiary Address"
              id="beneficiary"
              sx={{
                "minWidth": 300,
                "width": "30%",
                mr: 1,
              }}
              size='small'
            />
            <TextField
              margin="normal"
              required
              name="amount"
              label="Deposit Amount (In ETH)"
              id="amount"
              type="number"
              sx={{
                width: "10%",
                mr: 1,
              }}
              size='small'
            />
            <TextField
              margin="normal"
              required
              name="note"
              label="Note"
              id="note"
              sx={{
                mr: 1,
              }}
              size='small'
            />
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 2, mb: 2 }}
            >
              Deploy
            </Button>
    </Box>
            </Paper>
          </Grid>
        
        {/* Table */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Existing Contracts
    </Typography>
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Arbiter</TableCell>
            <TableCell>Beneficiary</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Note</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {escrows.map((escrow) => (
            <TableRow
              key={escrow.address}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{escrow.arbiter}</TableCell>
              <TableCell>{escrow.beneficiary}</TableCell>
              <TableCell>{ethers.utils.formatEther(escrow.value, "wei")}</TableCell>
              <TableCell>{escrow.note}</TableCell>
              <TableCell>{escrow.isApproved ? "Approved" : 
                <Button type="submit"
                variant="contained" onClick={handleApproveClick(escrow.address)}>Approve</Button>
              }</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
          </Paper>
        </Grid>
        </Grid>

      </Container>
    </Box>
  );
}

export default App;
