import React, { useEffect, useState, useContext } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { message } from "antd";
import { Context } from "../App";
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  "@global": {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  demo: {
    backgroundColor: "green",
    margin: theme.spacing(3, 0, 2),
    "&:hover": {
      backgroundColor: "purple", // 使用主题中定义的主色
    },
  },
}));

export default function SignInComponent({ handleDemoClick, handleSignInClick, getImagesById }) {
  const [email, setEmail] = useState("");
  const { hasLogin, setHasLogin, emailId, setEmailId } = useContext(Context);


  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // const passwordRegex = /^.{6,}$/;
  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const classes = useStyles();

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.elements.email.value;
    // const password = form.elements.password.value;
    if (!emailRegex.test(email)) {
      message.error("Please enter the correct email format");
      return;
    }
    // if (!passwordRegex.test(password)) {
    //   message.error('Please enter a password longer than 6 digits');
    //   return
    // }
    const registrationData = {
      email: email,
    };
    fetch("http://localhost:3000/registerByEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Registration failed");
        }
        return response.json();
      })
      .then((response) => {
        if(response.status === 201 || 200){
          message.success(response.message);
          handleSignInClick();
          getImagesById(response.id)
          setHasLogin(true)
          setEmailId(response.id)
        }
      })
      .catch((error) => {
        console.error("Registration error:", error.message);
      });
  }
  return (
    <Container
      component="main"
      maxWidth="xs"
    >
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Typography component="h3" variant="h5">
          Making your exclusive Photo
        </Typography>

        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleChange}
            pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
            inputProps={{
              pattern: emailRegex,
              title: "Enter a valid email address",
            }}
          />
          {/* <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          /> */}
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.demo}
            onClick={handleDemoClick}
          >
            Play with Demo
          </Button>
        </form>
      </div>
      <Box mt={8} style={{ marginBottom: "20px" }}>
        <Copyright />
      </Box>
    </Container>
  );
}
