import { useAppSelector } from '../store/hooks';
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';


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

      {pageNumber == 3 && (
       <Page3></Page3> 
      )}
    </>
       
  );
};

export default SignUpScreen;