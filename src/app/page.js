"use client";
import { useState, useEffect } from "react";
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
  Button,
  AppBar,
  Toolbar,
  Container,
  CssBaseline,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { fetchRecipesFromApi } from "../components/api";
import AddItemModal from "../components/additemmodel";
import InventoryTable from "../components/inventorytable";

const Home = () => {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState("");
  const [itemUnit, setItemUnit] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

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

 const capitalizeFirstLetter = (string) => {
   return string.charAt(0).toUpperCase() + string.slice(1);
 };

 const handleAddItem = async () => {
   if (!itemName.trim() || !itemCategory || !itemUnit) {
     return;
   }
   try {
     const uid = user.uid;
     const capitalizedItemName = itemName
       .split(" ")
       .map(capitalizeFirstLetter)
       .join(" ");
     const docRef = doc(
       collection(firestore, `users/${uid}/inventory`),
       capitalizedItemName
     );
     const docSnap = await getDoc(docRef);

     if (docSnap.exists()) {
       const { quantity } = docSnap.data();
       await setDoc(docRef, {
         name: capitalizedItemName,
         category: itemCategory,
         unit: itemUnit,
         quantity: quantity + itemQuantity,
       });
     } else {
       await setDoc(docRef, {
         name: capitalizedItemName,
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

  const handleEditItem = async (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemUnit(item.unit);
    setItemQuantity(item.quantity);
    setOpen(true);
  };

  const handleSaveEditItem = async () => {
    if (!itemName.trim() || !itemCategory || !itemUnit) {
      return;
    }
    try {
      const uid = user.uid;
      const docRef = doc(
        collection(firestore, `users/${uid}/inventory`),
        editingItem.id
      );
      await setDoc(docRef, {
        name: itemName,
        category: itemCategory,
        unit: itemUnit,
        quantity: itemQuantity,
      });

      await updateInventory(uid);
      handleClose();
    } catch (error) {
      console.error("Error saving edited item:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const uid = user.uid;
      const docRef = doc(collection(firestore, `users/${uid}/inventory`), id);
      await deleteDoc(docRef);
      await updateInventory(uid);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleIncrement = async (id) => {
    try {
      const uid = user.uid;
      const docRef = doc(collection(firestore, `users/${uid}/inventory`), id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity, ...data } = docSnap.data();
        await setDoc(docRef, {
          ...data,
          quantity: quantity + 1,
        });
        await updateInventory(uid);
      }
    } catch (error) {
      console.error("Error incrementing quantity:", error);
    }
  };

  const handleDecrement = async (id) => {
    try {
      const uid = user.uid;
      const docRef = doc(collection(firestore, `users/${uid}/inventory`), id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity, ...data } = docSnap.data();
        if (quantity > 1) {
          await setDoc(docRef, {
            ...data,
            quantity: quantity - 1,
          });
          await updateInventory(uid);
        }
      }
    } catch (error) {
      console.error("Error decrementing quantity:", error);
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
    setEditingItem(null);
  };

  const fetchRecipes = async () => {
    setLoading(true);
    const ingredients = inventory.map((item) => ({
      name: item.name,
      amount: item.quantity,
    }));
    const fetchedRecipes = await fetchRecipesFromApi(ingredients);
    setRecipes(fetchedRecipes);
    setLoading(false);
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
            <Button
              variant="outlined"
              sx={{ borderColor: "black", color: "black" }}
              onClick={fetchRecipes}
              disabled={loading}
            >
              {loading ? "Generating..." : "Recipes"}
            </Button>
          </Box>
          <InventoryTable
            inventory={inventory}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
          {recipes.length > 0 && (
            <Box mt={4} width="100%">
              <Typography variant="h4" mb={2}>
                Recipes
              </Typography>
              <Paper elevation={3} sx={{ padding: 2 }}>
                {recipes.map((recipe, index) => (
                  <Box key={index} mb={4}>
                    <Typography variant="h5" gutterBottom>
                      {recipe.title}
                    </Typography>
                    {recipe.steps.map((step, stepIndex) => (
                      <Typography key={stepIndex} paragraph>
                        {step}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Paper>
            </Box>
          )}
        </Box>
        <AddItemModal
          open={open}
          handleClose={handleClose}
          handleAddItem={editingItem ? handleSaveEditItem : handleAddItem}
          itemName={itemName}
          setItemName={setItemName}
          itemCategory={itemCategory}
          setItemCategory={setItemCategory}
          itemUnit={itemUnit}
          setItemUnit={setItemUnit}
          itemQuantity={itemQuantity}
          setItemQuantity={setItemQuantity}
        />
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
