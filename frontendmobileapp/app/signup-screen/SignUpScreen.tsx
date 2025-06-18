import { useAppSelector } from '../store/hooks';
import Page1 from './Page1';
import Page2 from './Page2';

const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const SignUpScreen = () => {
  const pageNumber = useAppSelector((state) => state.auth.SignupPageNo );

  return (
    <>
      {pageNumber == 1 && (
       <Page1></Page1> 
      )}

    {pageNumber == 2 && (
       <Page2></Page2> 
      )}
    </>
       
  );
};

export default SignUpScreen;