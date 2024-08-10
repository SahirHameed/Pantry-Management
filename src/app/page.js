"use client";
import { useState, useEffect } from "react";
import {
  auth,
  googleProvider,
  githubProvider,
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
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in successful:", result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      console.log("GitHub sign-in successful:", result.user);
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      console.log("Sign-out successful");
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
      sx={{
        p: 2,
        background: "linear-gradient(135deg, #f5f7fa 25%, #c3cfe2 100%)", // Subtle gradient background
        position: "relative",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {/* Additional Decorative Shapes */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          left: -50,
          width: 200,
          height: 200,
          bgcolor: "rgba(0, 0, 255, 0.15)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -60,
          right: -60,
          width: 180,
          height: 180,
          bgcolor: "rgba(0, 255, 0, 0.15)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 100,
          right: -80,
          width: 250,
          height: 250,
          bgcolor: "rgba(255, 0, 0, 0.1)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />

      {/* Main Content Box */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          bgcolor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Stronger shadow for depth
          borderRadius: 3,
          p: 5,
          width: "100%",
          maxWidth: "420px", // Slightly wider
          border: "1px solid rgba(0, 0, 0, 0.1)", // Soft border for better contrast
          zIndex: 1,
        }}
      >
        {/* Main Welcome Text */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mt: 2, fontWeight: "bold", color: "#333" }}
        >
          Welcome to Your Pantry!
        </Typography>

        {/* Short Description or Tagline */}
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Organize and manage your pantry items effortlessly.
        </Typography>

        {/* Divider */}
        <Box
          sx={{
            width: "100%",
            height: "1px",
            bgcolor: "#ddd",
            mb: 2,
          }}
        />

        {/* Call to Action */}
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          Sign in to access personalized recipes, manage inventory, and more!
        </Typography>

        {/* Sign-In Button */}
        {!user && (
          <Button
            variant="contained"
            sx={{
              bgcolor: "blue",
              color: "#fff",
              fontSize: "18px",
              padding: "12px 30px",
              borderRadius: "25px",
              textTransform: "none",
              mb: 2,
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
    </Box>
  );

  const InventoryScreen = (
  <Box
    display="flex"
    flexDirection="column"
    minHeight="100vh"
    sx={{
      p: 2,
      background: "linear-gradient(135deg, #f5f7fa 25%, #c3cfe2 100%)",
    }}
  >
    <AppBar position="static" sx={{ bgcolor: "#344955" }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: "bold", color: "#ffffff" }}
        >
          PantryPal
        </Typography>
        {user && (
          <Button
            variant="contained"
            sx={{
              bgcolor: "#F9AA33",
              color: "#344955",
              borderRadius: "20px",
              textTransform: "none",
              padding: "6px 20px",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#FF9800",
                transition: "background-color 0.3s ease-in-out",
              },
            }}
            onClick={signOutUser}
          >
            {user.displayName} | Sign Out
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
        <Typography
          variant="h3"
          mb={4}
          sx={{ color: "#344955", fontWeight: "bold" }}
        >
          Welcome to Your Pantry!!
        </Typography>
        <Box display="flex" gap={2} mb={4}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={{
              borderColor: "#344955",
              color: "#344955",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#F9AA33",
                borderColor: "#F9AA33",
                color: "#ffffff",
              },
            }}
          >
            Add Item
          </Button>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#344955",
              color: "#344955",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#F9AA33",
                borderColor: "#F9AA33",
                color: "#ffffff",
              },
            }}
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
            <Typography
              variant="h4"
              mb={2}
              sx={{ color: "#344955", fontWeight: "bold" }}
            >
              Recipes
            </Typography>
            <Paper
              elevation={3}
              sx={{
                padding: 2,
                maxHeight: "400px", // Set a fixed max height
                overflowY: "auto", // Enable vertical scrolling
              }}
            >
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
    <Box component="footer" bgcolor="#344955" color="white" p={2} mt="auto">
      <Typography variant="body1" textAlign="center">
        PantryPal © 2024
      </Typography>
    </Box>
  </Box>
);




  return user ? InventoryScreen : HomeScreen;
};

export default Home;
