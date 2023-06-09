import './Header.css';
import { Heading } from '@chakra-ui/react'
import { Alert, Button, ButtonGroup, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import MyContext from './Context';
import { Link, useLocation, useNavigate} from 'react-router-dom';


export default function Header (){
    ///Modal state
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);
    ///

    const [cSelected, setCSelected] = useState([]);
    const [rSelected, setRSelected] = useState(1);
  
    const onCheckboxBtnClick = (selected) => {
      const index = cSelected.indexOf(selected);
      if (index < 0) {
        cSelected.push(selected);
      } else {
        cSelected.splice(index, 1);
      }
      setCSelected([...cSelected]);
    };

    const [modalOption, setModalOption] = useState(true);

    ///form state
    const [emailLogValue, setEmailLogValue] = useState('');
    const [passwordLogValue, setPasswordLogValue] = useState('');
    
    const [emailRegValue, setEmailRegValue] = useState('');
    const [passwordRegValue, setPasswordRegValue] = useState('');
    const [nameRegValue, setNameRegValue] = useState('');

    const [pswValid, setPswValid] = useState(null);
    const [pswInvalid, setPswInvalid] = useState(null);

    const [regValid, setRegValid] = useState(null);
    const [regInvalid, setRegInvalid] = useState(null);

    const [logValid, setLogValid] = useState(null);    
    const [logInvalid, setLogInvalid] = useState(null);

    const [registrationPosted, setRegistrationPosted] = useState(null);

    const {currentAccount, setCurrentAccount, listsItems, setListsItems} = useContext(MyContext);

    //email regex pattern
    const emailRegex = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
    
    const handleRegEmail = (event) => {
    //   const emailRegValue = event.target.value;
      const inputType = event.target.type;
  
      // Check if the input value matches the input type
        if (emailRegex.test(event.target.value)) {
            setRegValid(true);
            setRegInvalid(false);
        } else {
            setRegInvalid(true);
            setRegValid(false);
        }
        
        setEmailRegValue(event.target.value);
    };

    function handleRegPassword(event){
        setPasswordRegValue(event.target.value);
    }
    function handleRegName(event){
        setNameRegValue(event.target.value);
    }

    function checkMatchingReg (event){
        if (event.target.value === passwordRegValue) {
            setPswValid(true);
            setPswInvalid(false);
        } else {
            setPswValid(false);
            setPswInvalid(true);
        }
    }
    async function handleRegistration(){
        if (emailRegex.test(emailRegValue) === true && pswValid === true) {
            await axios.post('https://citylookup.rf.gd/createAcct.php', {emailValue: emailRegValue, passwordValue: passwordRegValue, nameValue: nameRegValue},  
            {headers: {'Content-Type':'application/json'}})
            .then(response => {
                setCurrentAccount(response.data);
            })
            .then(setRegistrationPosted(true))
            .then(alert('Account created!'))
            .then(async () => await handleSignIn(currentAccount.email, currentAccount.password))
            .then(setEmailRegValue(''))
            .then(setPasswordRegValue(''))
            .catch(error => console.log(error))

            // setPswInvalid(null);
            // setPswValid(null);
        } else {
            showInvalidReg();
            return false;
        }

    }
    useEffect(() => {
        if (registrationPosted !== null) {
            toggle();
            console.log('Logging in...');
            // handleSignIn(currentAccount.email, currentAccount.password);
            
        }
    }, [registrationPosted])

    const handleLogEmail = (event) => {
        const inputValue = event.target.value;
        const inputType = event.target.type;
    
        // Check if the input value matches the input type
        //   if (emailRegex.test(inputValue)) {
        //       setLogValid(true);
        //       setLogInvalid(false);
        //   } else {
        //       setLogInvalid(true);
        //       setLogValid(false);
        //   }
          
          setEmailLogValue(inputValue);
      };
  
    // function handleLogPassword(event)
    //   setPasswordLogValue(event.target.value);
    // }

    async function handleSignIn (address, pass){   ////POST user credentials to logIn.php .. Script checks if credentials are valid. If so, returns json object
        if (emailRegex.test(emailLogValue) === true && passwordLogValue.length > 0) {
            await axios.post('https://citylookup.rf.gd/logIn.php', {email: address, password: pass},  
            {headers: {'Content-Type': 'application/json'}})
            ///If account does not exist in database, response from php as false; else send object
            .then(response => {
                if(response.data !== false){
                    setCurrentAccount(response.data);
                } else {
                    showInvalidLog();
                    // return false;
                }
            })
            .then(setShowSuccessSignIn())
            .then(setEmailLogValue(''))
            .then(setPasswordLogValue(''))
            .catch(error => console.log(error))
            setModalConfirm(false);
        } else {
            showInvalidLog();
            return false; 
            ///later set error validation
        }
    }

    useEffect(() => {
        if (currentAccount !== false && currentAccount !== null){
            axios.post('https://citylookup.rf.gd/retrieveLists.php', {email: currentAccount.email},
            {headers: {'Content-Type': 'application/json'}})
            .then(response => {
                // console.log(JSON.parse(response.data.list_array));
                setListsItems(JSON.parse(response.data.list_array));
            })
            // console.log(listsItems)
            // console.log('Logged In!');
        }
        else if (currentAccount === false){
            ///// STATE FOR ERROR MESSAGE IN MODAL
            console.log('User account does not exist in our records!')
            showInvalidLog();
        }
        // console.log(currentAccount)
    }, [currentAccount])

    function handleSignOut (){
        axios.post('https://citylookup.rf.gd/destroySession.php',
        {headers: {'Content-Type': 'application/json'}})
        // .then(response => {
        // //   console.log(response.data); // will return 'Session destroyed'
        // })
        .then(setShowSignOut())
        .then(setCurrentAccount(null))
        .then(setListsItems(false))
        .then(setRegInvalid(null))
        .then(setRegValid(null))
        .catch(error => {
          console.log(error);
        });

        setModal(false);  ///sets sign in/register modal to false
        navigate('/');
    }

    ////confirm modal
    const [modalConfirm, setModalConfirm] = useState(false);

    const toggleConfirm = () => setModalConfirm(!modalConfirm);


    //// to render route buttons conditionally
    const location = useLocation();
    const navigate = useNavigate();


    ///alerts
    const [visibleSignIn, setVisibleSignIn] = useState(null);
    const [visibleSignOut, setVisibleSignOut] = useState(null);

    const onDismissSignInAlert = () => setVisibleSignIn(false);
    const onDismissSignOut = () => setVisibleSignOut(false);
    
    function setShowSuccessSignIn() {
        setVisibleSignIn(true);
        setTimeout(() => {
            setVisibleSignIn(false)
        }, 5000)
    }
    
    function setShowSignOut() {
        setVisibleSignOut(true);
        setTimeout(() => {
            setVisibleSignOut(false)
        }, 5000)
    }

    //alerts for auth modal
    const [visibleInvalidLog, setVisibleInvalidLog] = useState(false);
    const [visibleInvalidReg, setVisibleInvalidReg] = useState(false);

    // const onDismissSignInAlert = () => setVisibleSignIn(false);
    // const onDismissSignOut = () => setVisibleSignOut(false);
    
    function showInvalidLog() {
        setVisibleInvalidLog(true);
        setTimeout(() => {
            setVisibleInvalidLog(false)
        }, 5000)
    }
    
    function showInvalidReg() {
        setVisibleInvalidReg(true);
        setTimeout(() => {
            setVisibleInvalidReg(false)
        }, 5000)
    }


    return(
    <>
        <div id='nav'>   
        {!currentAccount &&
        <>       
            <div className='nav-buttons'>
                <Button color='light' outline='filled' onClick={toggle}>Sign In/Create Account</Button>
                <p>Information sourced from the Teleport API</p>
            </div>
        
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    <ButtonGroup>
                        <Button
                        color="dark"
                        // outline
                        onClick={() => setRSelected(1)}
                        active={rSelected === 1}
                        >
                        Sign In
                        </Button>
                        <Button
                        color="dark"
                        // outline
                        onClick={() => setRSelected(2)}
                        active={rSelected === 2}
                        >
                            Create Account
                        </Button>
                    </ButtonGroup>
                </ModalHeader>
                
                {rSelected === 1 &&
                <ModalBody>
                    <h4>Email Address</h4>
                  <Input
                    bsSize="lg"
                    type="email"
                    value={emailLogValue}
                    onChange={handleLogEmail}
                    />
                    
                    <h4>Password</h4>
                    <Input
                        bsSize="lg"
                        type="password"
                        value={passwordLogValue}
                        onChange={(event) => setPasswordLogValue(event.target.value)}
                    />
                    <div id='demo-container'>
                        <h4>Demo Account</h4>
                        <p><u>Email Address:</u> second@gmail.com</p>
                        <p><u>Password:</u> second</p>
                    </div>
                    
                    <Alert color='danger' isOpen={visibleInvalidLog}>
                        Invalid User Credentials.
                    </Alert>
                </ModalBody>
                }
                {rSelected === 2 &&
                <>
                <ModalBody>
                    <h4>Register Your Email Address</h4>
                  <Input
                    bsSize="lg"
                    type="email"
                    onChange={handleRegEmail}
                    valid={regValid}
                    invalid={regInvalid}
                    />
                    
                    <h4>Create A Password</h4>
                    <Input
                        bsSize="lg"
                        onChange={handleRegPassword}
                        type="password"
                    />
                    <h4>Confirm Your Password</h4>
                    <Input
                        bsSize="lg"
                        onChange={checkMatchingReg}
                        type="password"
                        valid={pswValid}
                        invalid={pswInvalid}
                    />

                    <h4>What Should We Call You?</h4>
                    <Input
                        bsSize="lg"
                        onChange={handleRegName}
                        type="text"
                    />


                </ModalBody>
                    <Alert color='danger' isOpen={visibleInvalidReg}>
                        Invalid Account Credentials. Follow Instructions.
                    </Alert>
                </>
                }
                <ModalFooter style={{justifyContent: 'center'}}>
                    {rSelected === 1 &&
                    <Button color="primary" 
                    onClick={() => handleSignIn(emailLogValue, passwordLogValue)}
                    >
                        Sign In
                    </Button>
                    }
                    {rSelected === 2 &&
                    <Button color="primary" 
                    onClick={handleRegistration}
                    
                    >
                        Create Account
                    </Button>
                    }
                    <Button outline color="dark" onClick={toggle}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>

        </>
        }
        {currentAccount &&
        <>
            <div className='nav-buttons'>
                <Button color='light' outline='filled' onClick={toggleConfirm}>Sign Out</Button>
                {location.pathname === '/' ?
                <Link to='/Lists'>
                    <Button color='light' outline='filled'>My Lists</Button>
                </Link>
                :
                location.pathname === '/lists' || location.pathname === '/Lists' &&
                <Link to='/'>
                    <Button color='light' outline='filled'>Home</Button>
                </Link>
                }
                <h5>Welcome, {currentAccount.name}!</h5>
                <p>Information sourced from the Teleport API</p>
            </div>
            <div>

            <Modal isOpen={modalConfirm} toggle={toggleConfirm}>
                {/* toggle={toggleConfirm} */}
                <ModalHeader>Sign Out?</ModalHeader>
                <ModalBody>
                    Please confirm that you wish to sign out.
                </ModalBody>
                <ModalFooter>
                <Button color="primary" onClick={handleSignOut}>
                    Sign Out
                </Button>{' '}
                <Button color="secondary" onClick={toggleConfirm}>
                    Cancel
                </Button>
                </ModalFooter>
            </Modal>
            </div>  
        </>
        }
        
        </div>
        
        <section id="header-section"> 
            <nav>
                <Heading style={{textAlign:'center'}} as='h1' size='xl'>
                    City Lookup
                </Heading>
            </nav>
        </section>

        <Alert className='auth-alert' color="success" isOpen={visibleSignIn} toggle={onDismissSignInAlert}>
            You have successfully signed in!
        </Alert>

        <Alert className='auth-alert' color="primary" isOpen={visibleSignOut} toggle={onDismissSignOut}>
            You have successfully signed out.
        </Alert>

    </>    
    );
}