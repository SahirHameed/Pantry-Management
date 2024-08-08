"use client";
import { useState, useEffect, useCallback } from "react";
import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  firestore,
} from "../lib/firebase";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CssBaseline,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

const categories = [
  "Grains",
  "Vegetables",
  "Fruits",
  "Dairy",
  "Protein",
  "Others",
];
const units = ["kg", "grams", "liters", "units", "packs", "dozens"];

const Home = () => {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        updateInventory(user.uid);
      } else {
        setInventory([]);
      }
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

  const updateInventory = async (uid) => {
    try {
      const q = query(collection(firestore, `users/${uid}/inventory`));
      const querySnapshot = await getDocs(q);
      const inventoryList = [];
      querySnapshot.forEach((doc) => {
        inventoryList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  const handleAddItem = async () => {
    if (!itemName.trim() || !itemCategory || !itemUnit) {
      return;
    }
    try {
      const uid = user.uid;
      const docRef = doc(
        collection(firestore, `users/${uid}/inventory`),
        itemName
      );
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

      await updateInventory(uid);
      handleClose();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

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

  const HomeScreen = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      sx={{ textAlign: "center", p: 2 }}
    >
      <CssBaseline />
      <Typography variant="h2" gutterBottom sx={{ mt: 4 }}>
        Welcome to Your Pantry!!
      </Typography>
      {!user && (
        <Button
          variant="contained"
          sx={{
            bgcolor: "blue",
            color: "#fff",
            fontSize: "20px",
            padding: "10px 20px",
            borderRadius: "8px",
            mt: 4,
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
    </Box>
  );

  const InventoryScreen = (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      bgcolor="white"
    >
      <AppBar position="static" sx={{ bgcolor: "black" }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PantryPal
          </Typography>
          {user && (
            <>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, textAlign: "right", mr: 2 }}
              >
                Hello, {user.displayName}
              </Typography>
              <Button
                variant="contained"
                sx={{ bgcolor: "red", color: "#fff" }}
                onClick={signOutUser}
              >
                Sign out
              </Button>
            </>
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
          <Typography variant="h3" mb={4}>
            Welcome to Your Pantry!!
          </Typography>
          <Box display="flex" gap={2} mb={4}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpen}
              sx={{ borderColor: "black", color: "black" }}
            >
              Add Item
            </Button>
          </Box>
          <Paper elevation={3} sx={{ width: "100%", borderRadius: "8px" }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "grey" }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
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
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Unit</InputLabel>
                <Select
                  value={itemUnit}
                  onChange={(e) => setItemUnit(e.target.value)}
                  label="Unit"
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
              sx={{ bgcolor: "black", color: "white" }}
              onClick={handleAddItem}
            >
              Add
            </Button>
          </Box>
        </Modal>
      </Container>
      <Box component="footer" bgcolor="black" color="white" p={2} mt="auto">
        <Typography variant="body1" textAlign="center">
          PantryPal © 2024
        </Typography>
      </Box>
    </Box>
  );

  return user ? InventoryScreen : HomeScreen;
};

export default Home;
