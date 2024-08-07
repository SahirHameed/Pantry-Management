"use client";
import { useState, useEffect } from "react";
import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  firestore,
} from "@/firebase";
import {
  Box,
  Typography,
  Modal,
  Stack,
  TextField,
  Button,
  IconButton,
  Paper,
  AppBar,
  Toolbar,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

export default function Home() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [showHomeScreen, setShowHomeScreen] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateInventory = async () => {
    try {
      const q = query(collection(firestore, "inventory"));
      const querySnapshot = await getDocs(q);
      const inventoryList = [];
      querySnapshot.forEach((doc) => {
        inventoryList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
      console.log(inventoryList);
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const addItem = async () => {
    try {
      const docRef = doc(collection(firestore, "inventory"), itemName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, {
          category: itemCategory,
          unit: itemUnit,
          quantity: quantity + itemQuantity,
        });
      } else {
        await setDoc(docRef, {
          category: itemCategory,
          unit: itemUnit,
          quantity: itemQuantity,
        });
      }

      await updateInventory();
      handleClose();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const editItem = async () => {
    try {
      const docRef = doc(collection(firestore, "inventory"), editingItem.id);
      await setDoc(docRef, {
        category: itemCategory,
        unit: itemUnit,
        quantity: itemQuantity,
      });

      await updateInventory();
      handleEditClose();
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      const docRef = doc(collection(firestore, "inventory"), id);
      await deleteDoc(docRef);
      await updateInventory();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => {
    setItemName("");
    setItemCategory("");
    setItemUnit("");
    setItemQuantity(1);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditOpen = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemUnit(item.unit);
    setItemQuantity(item.quantity);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditingItem(null);
    setEditOpen(false);
  };

  const captureImage = () => {
    // Implement image capturing functionality here
  };

  const HomeScreen = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="white"
    >
      <Typography variant="h3" color="green" gutterBottom>
        Welcome to PantryPal!
      </Typography>
      <Button
        variant="contained"
        sx={{
          bgcolor: "green",
          color: "#fff",
          fontSize: "20px",
          padding: "10px 20px",
          borderRadius: "8px",
          "&:hover": {
            bgcolor: "darkgreen",
            transform: "scale(1.05)",
            transition: "all 0.3s ease-in-out",
          },
        }}
        onClick={() => setShowHomeScreen(false)}
      >
        Manage Inventory
      </Button>
      {!user && (
        <Button
          variant="contained"
          sx={{
            bgcolor: "blue",
            color: "#fff",
            fontSize: "20px",
            padding: "10px 20px",
            borderRadius: "8px",
            mt: 2,
            "&:hover": {
              bgcolor: "darkblue",
              transform: "scale(1.05)",
              transition: "all 0.3s ease-in-out",
            },
          }}
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </Button>
      )}
      {user && (
        <Button
          variant="contained"
          sx={{
            bgcolor: "red",
            color: "#fff",
            fontSize: "20px",
            padding: "10px 20px",
            borderRadius: "8px",
            mt: 2,
            "&:hover": {
              bgcolor: "darkred",
              transform: "scale(1.05)",
              transition: "all 0.3s ease-in-out",
            },
          }}
          onClick={signOutUser}
        >
          Sign out
        </Button>
      )}
    </Box>
  );

  const InventoryScreen = () => (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="white"
    >
      <AppBar position="static" sx={{ bgcolor: "green" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PantryPal
          </Typography>
          {user && (
            <Button
              variant="contained"
              sx={{ bgcolor: "red", color: "#fff" }}
              onClick={signOutUser}
            >
              Sign out
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ flexGrow: 1 }}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
          mt={4}
          mb={4}
        >
          <Typography variant="h3" color="green" mb={4}>
            Welcome to Your Pantry!!
          </Typography>
          <Box display="flex" gap={2} mb={4}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{ borderColor: "green", color: "green" }}
            >
              Add Item
            </Button>
            <Button
              variant="outlined"
              startIcon={<CameraAltIcon />}
              onClick={captureImage}
              sx={{ borderColor: "green", color: "green" }}
            >
              Capture Image
            </Button>
          </Box>
          <Paper elevation={3} sx={{ width: "100%", borderRadius: "8px" }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "lightgreen" }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEditOpen(item)}
                          sx={{ color: "green" }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => deleteItem(item.id)}
                          sx={{ color: "green" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
              borderRadius: "8px",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Add Item</Typography>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Stack width="100%" spacing={2}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Category"
                variant="outlined"
                fullWidth
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              />
              <TextField
                label="Unit"
                variant="outlined"
                fullWidth
                value={itemUnit}
                onChange={(e) => setItemUnit(e.target.value)}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value))}
              />
            </Stack>
            <Button
              variant="contained"
              sx={{ bgcolor: "green" }}
              onClick={addItem}
            >
              Add
            </Button>
          </Box>
        </Modal>
        <Modal open={editOpen} onClose={handleEditClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
              borderRadius: "8px",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Edit Item</Typography>
              <IconButton onClick={handleEditClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Stack width="100%" spacing={2}>
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Category"
                variant="outlined"
                fullWidth
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              />
              <TextField
                label="Unit"
                variant="outlined"
                fullWidth
                value={itemUnit}
                onChange={(e) => setItemUnit(e.target.value)}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value))}
              />
            </Stack>
            <Button
              variant="contained"
              sx={{ bgcolor: "green" }}
              onClick={editItem}
            >
              Save
            </Button>
          </Box>
        </Modal>
      </Container>
      <Box component="footer" bgcolor="green" color="#fff" p={2} mt="auto">
        <Typography variant="body1" textAlign="center">
          PantryPal © 2024
        </Typography>
      </Box>
    </Box>
  );

  return showHomeScreen ? <HomeScreen /> : <InventoryScreen />;
}
